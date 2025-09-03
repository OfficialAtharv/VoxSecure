import React, { useState, useRef, useEffect } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { FaUser, FaMicrophone, FaStop } from 'react-icons/fa';
import bgGif from '../../assets/bg.gif';

const Login = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [passphrase, setPassphrase] = useState(''); // ✅ passphrase state

  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const passphrases = [
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
  ];

  // ✅ Generate passphrase only once on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * passphrases.length);
    setPassphrase(passphrases[randomIndex]);
  }, []); // empty dependency array

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
      formData.append("passphrase", passphrase);  // ✅ send fixed passphrase
      formData.append("recording", file);

      const res = await fetch("http://localhost:8000/login", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) alert("Login Successful");
      else alert("Login Failed: " + data.message);
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

        <div className="passphrase-section">
          <p className="passphrase-label">Please speak the following passphrase:</p>
          <p className="passphrase-text">"{passphrase}"</p>  {/* ✅ fixed */}
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
