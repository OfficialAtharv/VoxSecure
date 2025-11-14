import React, { useState, useRef, useEffect } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { FaUser, FaMicrophone, FaStop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import bgGif from '../../assets/bg.gif';

const Login = ({ theme }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [language, setLanguage] = useState('english'); // ✅ Language state

  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const passphrases = {
    english: [
      "Voice Unlock Access",
      "Trust the Sound",
      "Speak to Sign In",
      "Authenticate Me",
      "Vocal Identity Check",
      "Let Me In",
      "Verify My Voice",
      "Sound is Key",
      "Secure Entry Now",
      "Log Me In Securely"
    ],
    marathi: [
      "माझा आवाज ओळखा",
      "सुरक्षित प्रवेश द्या",
      "माझ्या आवाजावर विश्वास ठेवा",
      "बोलून साइन इन करा",
      "माझी ओळख तपासा",
      "आवाज म्हणजेच ओळख",
      "माझा प्रवेश द्या",
      "सुरक्षित लॉगिन करा",
      "आवाजाने प्रमाणीकरण",
      "माझ्या आवाजाने उघडा"
    ],
    hindi: [
      "मेरी आवाज पहचानो",
      "आवाज से लॉगिन करो",
      "मुझे साइन इन करने दो",
      "सुरक्षित प्रवेश दो",
      "मेरी पहचान सत्यापित करो",
      "आवाज है पहचान",
      "लॉगिन की अनुमति दो",
      "आवाज से प्रमाणित करो",
      "सुरक्षित प्रवेश करें",
      "मेरी आवाज से खोलो"
    ],
  };

  // ✅ Update passphrase when language changes or page loads
  useEffect(() => {
    const phrases = passphrases[language];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setPassphrase(phrases[randomIndex]);
  }, [language]); // regenerate when language changes

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        audioChunksRef.current = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleLogin = async () => {
  if (!email) return alert("Please enter your email");
  if (!audioURL) return alert("Please record your voice");

  try {
    const blob = await (await fetch(audioURL)).blob();
    const file = new File([blob], "login_audio.webm", { type: 'audio/webm' });

    const formData = new FormData();
    formData.append("email", email);
    formData.append("passphrase", passphrase);
    formData.append("language", language);
    formData.append("recording", file);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      alert("Login Successful 🎉");
      localStorage.setItem("userEmail", email); // save email
      navigate("/voice-command"); // redirect to voice command page ✅
    } else {
      alert("Login Failed: " + data.message);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Error during login");
  }
};

  return (
    <div className={`login-page ${theme}`}>
      <div className="background-animation" style={{ backgroundImage: `url(${bgGif})` }} />
      <div className="login-card">
        <h1 className="login-title fancy-title">VoxSecure</h1>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="email"
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ✅ Language selector */}
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

        <div className="passphrase-section">
          <p className="passphrase-label">Please speak the following passphrase:</p>
          <p className="passphrase-text">"{passphrase}"</p>
        </div>

        <div className="controls-container">
          <div className="audio-controls-wrapper">
            <button
              className="icon-btn"
              onClick={startRecording}
              disabled={isRecording}
              title="Start Recording"
              style={{ color: isRecording ? 'gray' : 'green' }}
            >
              <FaMicrophone size={22} />
            </button>

            <button
              className="icon-btn"
              onClick={stopRecording}
              disabled={!isRecording}
              title="Stop Recording"
              style={{ color: !isRecording ? 'gray' : 'red' }}
            >
              <FaStop size={22} />
            </button>
          </div>

          <button
            className="login-btn main-btn"
            onClick={handleLogin}
            disabled={!audioURL || !email}
          >
            Login
          </button>
        </div>

        <p className="register-link">
          Don’t have an account? <Link to="/Register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
