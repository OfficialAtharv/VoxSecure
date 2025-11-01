import React, { useState, useRef } from "react";
import "../Login/Login.css";
import "./Register.css";
import { FaUser } from "react-icons/fa";
import bgGif from "../../assets/bg.gif";

const Register = ({ theme }) => {
  const [form, setForm] = useState({ email: "", name: "", mobile: "" });
  const [audioURLs, setAudioURLs] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [language, setLanguage] = useState("english"); // ✅ Language state
  const audioChunksRef = useRef([]);

  // ✅ Passphrases for all languages
  const passphrases = {
    english: [
      "Voice is the key",
      "Unlock with your voice",
      "Secure voice identity",
    ],
    marathi: [
      "आवाज म्हणजेच ओळख",
      "तुमच्या आवाजाने उघडा",
      "सुरक्षित आवाज ओळख",
    ],
    hindi: [
      "आवाज है चाबी",
      "अपनी आवाज से खोलो",
      "सुरक्षित आवाज पहचान",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const { email, name, mobile } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z ]{2,}$/;
    const mobileRegex = /^[0-9]{10}$/;
    return (
      emailRegex.test(email) && nameRegex.test(name) && mobileRegex.test(mobile)
    );
  };

  const startRecording = async () => {
    if (!isFormValid()) {
      alert("Please fill out all fields with valid information before recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURLs((prev) => {
          const updated = [...prev, url];
          if (updated.length === 3) {
            alert("Audio recordings completed successfully!");
          }
          return updated;
        });
        audioChunksRef.current = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid() || audioURLs.length < 3) {
      alert("Please complete all fields and record all 3 passphrases.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("name", form.name);
      formData.append("mobile", form.mobile);
      formData.append("language", language); // ✅ include language info

      // Append audio files
      for (let i = 0; i < audioURLs.length; i++) {
        const response = await fetch(audioURLs[i]);
        const blob = await response.blob();
        formData.append("recordings", blob, `recording_${i + 1}.webm`);
      }

      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register user");
      }

      console.log("Server response:", data);
      alert("Registration successful!");

      // Reset form after successful submission
      setForm({ email: "", name: "", mobile: "" });
      setAudioURLs([]);
    } catch (err) {
      console.error("Error:", err);
      alert("Error during registration. Please try again.");
    }
  };

  return (
    <div
      className={`login-page ${theme}`}
      style={{ overflowY: "auto", maxHeight: "100vh" }}
    >
      <div
        className="background-animation"
        style={{ backgroundImage: `url(${bgGif})` }}
      />
      <div className="login-card">
        <h1 className="login-title fancy-title">VoxSecure</h1>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="tel"
            placeholder="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
          />
        </div>

        {/* ✅ Language Selector */}
        <div className="language-selector">
          <label htmlFor="language">Choose Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="marathi">Marathi</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>

        {audioURLs.length < 3 && (
          <>
            <div className="passphrase-section">
              <p className="passphrase-label">
                Please speak the following passphrase ({audioURLs.length + 1}/3):
              </p>
              <p className="passphrase-text">
                "{passphrases[language][audioURLs.length]}"
              </p>
            </div>

            <div className="audio-controls">
              <button
                className="login-btn"
                onClick={startRecording}
                disabled={isRecording || audioURLs.length >= 3}
              >
                Start Recording
              </button>
              <button
                className="login-btn"
                onClick={stopRecording}
                disabled={!isRecording}
              >
                Stop Recording
              </button>
            </div>
          </>
        )}

        {audioURLs.length > 0 && (
          <div className="recording-previews">
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              Recorded clips:
            </p>
            <ul>
              {audioURLs.map((url, idx) => (
                <li key={idx}>Audio {idx + 1} ✔️</li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={audioURLs.length < 3 || !isFormValid()}
          style={{ marginTop: "20px" }}
        >
          Submit Registration
        </button>

        <p style={{ marginTop: "15px", fontSize: "14px", textAlign: "center" }}>
          Already have an account? <a href="/Login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
