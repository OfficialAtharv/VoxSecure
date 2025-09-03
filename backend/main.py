from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import JSONResponse
from scipy.spatial.distance import cosine

import os
import shutil
from typing import List
import librosa
import numpy as np
import traceback
import subprocess
import datetime

# ----------------- Force FFmpeg path BEFORE importing whisper -----------------
os.environ["FFMPEG_BINARY"] = r"C:\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"
FFMPEG_BIN = os.environ.get("FFMPEG_BINARY")
if not FFMPEG_BIN or not os.path.exists(FFMPEG_BIN):
    raise FileNotFoundError(f"FFmpeg not found at {FFMPEG_BIN}. Please check the path.")
else:
    print(f"FFmpeg found at {FFMPEG_BIN}")

import whisper  # import after setting FFmpeg path

# ----------------- Load Whisper model once -----------------
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper model loaded successfully")

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
def extract_mfcc(file_path, n_mfcc=13):
    """Extract MFCC features from a WAV file"""
    y, sr = librosa.load(file_path, sr=None)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    return np.mean(mfccs, axis=1).tolist()

def convert_webm_to_wav(webm_path, wav_path):
    """Convert WebM to WAV using FFmpeg"""
    if not FFMPEG_BIN or not os.path.exists(FFMPEG_BIN):
        raise FileNotFoundError(f"FFmpeg not found at {FFMPEG_BIN}")

    command = f'"{FFMPEG_BIN}" -y -i "{webm_path}" "{wav_path}"'
    subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# ----------------- Registration -----------------
@app.post("/register")
async def register_user(
    email: str = Form(...),
    name: str = Form(...),
    mobile: str = Form(...),
    recordings: List[UploadFile] = File(...)
):
    saved_files = []
    mfcc_features_list = []

    try:
        for idx, audio in enumerate(recordings):
            safe_email = email.replace('@', '_').replace('.', '_')
            webm_path = os.path.join(UPLOAD_DIR, f"{safe_email}_rec_{idx+1}.webm")
            wav_path = os.path.join(UPLOAD_DIR, f"{safe_email}_rec_{idx+1}.wav")

            with open(webm_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)

            convert_webm_to_wav(webm_path, wav_path)
            mfcc_features_list.append(extract_mfcc(wav_path))
            saved_files.append(wav_path)
            os.remove(webm_path)

    except Exception as e:
        tb = traceback.format_exc()
        print("Error saving files or extracting features:\n", tb)
        return JSONResponse({"success": False, "message": f"Error saving files or extracting features: {str(e)}"})

    user_data = {
        "email": email,
        "name": name,
        "mobile": mobile,
        "recordings": saved_files,
        "mfcc_features": mfcc_features_list
    }

    try:
        insert_result = await users_collection.insert_one(user_data)
        user_data["_id"] = str(insert_result.inserted_id)
    except Exception as e:
        return JSONResponse({"success": False, "message": f"Database error: {str(e)}"})

    return JSONResponse({"success": True, "message": "User registered successfully", "data": user_data})

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
        "transcribed_text": None,
        "message": None
    }

    try:
        # Save uploaded WebM file
        with open(webm_path, "wb") as buffer:
            shutil.copyfileobj(recording.file, buffer)

        # Convert to WAV
        convert_webm_to_wav(webm_path, wav_path)

        # Extract MFCC
        login_mfcc = extract_mfcc(wav_path)

        # Fetch user from DB
        user = await users_collection.find_one({"email": email})
        if not user:
            login_attempt["message"] = "User not found"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({"success": False, "message": "User not found"})

        # Compare MFCC similarity
        threshold = 0.05
        matched = False
        best_similarity = 0
        for db_mfcc in user["mfcc_features"]:
            similarity = 1 - cosine(login_mfcc, db_mfcc)
            best_similarity = max(best_similarity, similarity)
            if similarity > (1 - threshold):
                matched = True
                break

        login_attempt["similarity"] = best_similarity

        if not matched:
            login_attempt["message"] = "Voice not recognized"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({"success": False, "message": "Voice not recognized", "similarity": best_similarity})

        # Passphrase verification using Whisper
        result = whisper_model.transcribe(wav_path)
        spoken_text = result["text"].strip().lower()
        login_attempt["transcribed_text"] = spoken_text

        if passphrase.lower() not in spoken_text:
            login_attempt["message"] = "Passphrase mismatch"
            await login_attempts_collection.insert_one(login_attempt)
            return JSONResponse({"success": False, "message": "Passphrase mismatch", "spoken": spoken_text})

        # Success
        login_attempt["success"] = True
        login_attempt["message"] = "Login successful"
        await login_attempts_collection.insert_one(login_attempt)

        return JSONResponse({"success": True, "message": "Login successful"})

    except Exception as e:
        tb = traceback.format_exc()
        print("Login error:\n", tb)
        login_attempt["message"] = str(e)
        await login_attempts_collection.insert_one(login_attempt)
        return JSONResponse({"success": False, "message": f"Login failed: {str(e)}"})

    finally:
        # Always clean up temp files
        for f in [webm_path, wav_path]:
            if os.path.exists(f):
                os.remove(f)
