from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import JSONResponse
from scipy.spatial.distance import cosine

import os
import shutil
from typing import List
import numpy as np
import traceback
import subprocess
import datetime
import torch
import librosa
import re

# ----------------- FFmpeg Path -----------------
FFMPEG_BIN = r"C:\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_BIN):
    raise FileNotFoundError(f"FFmpeg not found at {FFMPEG_BIN}. Please check the path.")

# ----------------- Import Models -----------------
import whisper
from speechbrain.pretrained import EncoderClassifier

# ----------------- Load Models Once -----------------
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper model loaded successfully")

print("Loading Speaker Embedding model...")
spk_model = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb"
)
print("Speaker model loaded successfully")

# ----------------- FastAPI App -----------------
app = FastAPI()

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Database -----------------
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client.voice_auth_system
users_collection = db.users
login_attempts_collection = db.login_attempts

# ----------------- Upload Directory -----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- Helper Functions -----------------
def convert_webm_to_wav(webm_path, wav_path):
    command = f'"{FFMPEG_BIN}" -y -i "{webm_path}" -ar 16000 -ac 1 "{wav_path}"'
    subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def safe_remove(path):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"[WARN] Could not delete {path}: {e}")

def extract_speaker_embedding(file_path):
    """
    Corrected embedding extraction using encode_batch.
    """
    try:
        # Load waveform with librosa
        signal, sr = librosa.load(file_path, sr=16000)
        signal_tensor = torch.tensor(signal).unsqueeze(0)  # add batch dim
        embedding = spk_model.encode_batch(signal_tensor)
        return embedding.squeeze().detach().cpu().numpy().flatten().tolist()
    except Exception as e:
        raise ValueError(f"Error extracting embedding: {e}")

# ----------------- Registration -----------------
@app.post("/register")
async def register_user(
    email: str = Form(...),
    name: str = Form(...),
    mobile: str = Form(...),
    recordings: List[UploadFile] = File(...)
):
    saved_files = []
    embeddings_list = []

    try:
        for idx, audio in enumerate(recordings):
            safe_email = email.replace('@', '_').replace('.', '_')
            webm_path = os.path.join(UPLOAD_DIR, f"{safe_email}_rec_{idx+1}.webm")
            wav_path = os.path.join(UPLOAD_DIR, f"{safe_email}_rec_{idx+1}.wav")

            with open(webm_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)

            convert_webm_to_wav(webm_path, wav_path)
            embeddings_list.append(extract_speaker_embedding(wav_path))
            saved_files.append(wav_path)
            safe_remove(webm_path)

        user_data = {
            "email": email,
            "name": name,
            "mobile": mobile,
            "recordings": saved_files,
            "embeddings": embeddings_list
        }

        insert_result = await users_collection.insert_one(user_data)
        user_data["_id"] = str(insert_result.inserted_id)
        print(f"[DEBUG] User inserted with ID: {insert_result.inserted_id}")

        return JSONResponse({"success": True, "message": "User registered successfully", "data": user_data})

    except Exception as e:
        tb = traceback.format_exc()
        print(f"[ERROR] Registration failed:\n{tb}")
        return JSONResponse({"success": False, "message": f"Registration failed: {str(e)}"})

# ----------------- Login -----------------
@app.post("/login")
async def login_user(
    email: str = Form(...),
    passphrase: str = Form(...),
    recording: UploadFile = File(...)
):
    safe_email = email.replace('@', '_').replace('.', '_')
    webm_path = os.path.join(UPLOAD_DIR, f"{safe_email}_login.webm")
    wav_path = os.path.join(UPLOAD_DIR, f"{safe_email}_login.wav")

    login_attempt = {
        "email": email,
        "timestamp": datetime.datetime.utcnow(),
        "success": False,
        "similarity": None,
        "similarities": [],
        "transcribed_text": None,
        "message": None
    }

    try:
        with open(webm_path, "wb") as buffer:
            shutil.copyfileobj(recording.file, buffer)

        convert_webm_to_wav(webm_path, wav_path)
        login_embedding = extract_speaker_embedding(wav_path)

        user = await users_collection.find_one({"email": email})
        if not user:
            login_attempt["message"] = "User not found"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({"success": False, "message": "User not found"})

        threshold = 0.35
        matched = False
        best_similarity = 0
        similarities = []

        for db_emb in user.get("embeddings", []):
            db_emb = np.array(db_emb)
            similarity = 1 - cosine(login_embedding, db_emb)
            similarities.append(similarity)
            best_similarity = max(best_similarity, similarity)
            if similarity > threshold:
                matched = True

        login_attempt["similarity"] = best_similarity
        login_attempt["similarities"] = similarities
        print(f"[DEBUG] Similarities for {email}: {similarities}")

        if not matched:
            login_attempt["message"] = "Voice not recognized"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({
                "success": False,
                "message": "Voice not recognized",
                "similarities": similarities
            })

        result = whisper_model.transcribe(wav_path, fp16=False)
        spoken_text = result["text"].strip().lower()
        login_attempt["transcribed_text"] = spoken_text

        if not re.search(rf"\b{re.escape(passphrase.lower())}\b", spoken_text):
            login_attempt["message"] = "Passphrase mismatch"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({
                "success": False,
                "message": "Passphrase mismatch",
                "spoken": spoken_text,
                "similarities": similarities
            })

        login_attempt["success"] = True
        login_attempt["message"] = "Login successful"
        await login_attempts_collection.insert_one(login_attempt)
        return JSONResponse({"success": True, "message": "Login successful"})

    except Exception as e:
        tb = traceback.format_exc()
        print(f"[ERROR] Login failed:\n{tb}")
        login_attempt["message"] = str(e)
        await login_attempts_collection.insert_one(login_attempt)
        return JSONResponse({"success": False, "message": f"Login failed: {str(e)}"})

    finally:
        for f in [webm_path, wav_path]:
            safe_remove(f)
