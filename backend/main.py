from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import shutil
from typing import List
import librosa
import numpy as np
import traceback
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client.voice_auth_system
users_collection = db.users

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_mfcc(file_path, n_mfcc=13):
    y, sr = librosa.load(file_path, sr=None)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    mfccs_mean = np.mean(mfccs, axis=1)
    return mfccs_mean.tolist()

def convert_webm_to_wav(webm_path, wav_path):
    # 🔹 Make sure this path points to your actual ffmpeg.exe file
    FFMPEG_BIN = r"C:\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"
    try:
        subprocess.run(
            [FFMPEG_BIN, "-y", "-i", webm_path, wav_path],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e.stderr.decode())
        raise

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

            # Save uploaded webm
            with open(webm_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)

            # Convert to wav
            convert_webm_to_wav(webm_path, wav_path)

            # Extract MFCC
            mfcc = extract_mfcc(wav_path)
            mfcc_features_list.append(mfcc)
            saved_files.append(wav_path)

            # Remove the original webm file
            os.remove(webm_path)

    except Exception as e:
        tb = traceback.format_exc()
        print("Error saving files or extracting features:\n", tb)
        return {"error": f"Error saving files or extracting features: {str(e)}"}

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
        print("Database error:", e)
        return {"error": f"Database error: {str(e)}"}

    return {"message": "User registered successfully", "data": user_data}
