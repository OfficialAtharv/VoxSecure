import React, { useState, useRef } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import bgGif from '../../assets/bg.gif';

const Login = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
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

const randomIndex = Math.floor(Math.random() * passphrases.length);
const passphrase = passphrases[randomIndex];


  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
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

  return (
    <div className={`login-page ${theme}`}>
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
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="passphrase-section">
          <p className="passphrase-label">Please speak the following passphrase:</p>
          <p className="passphrase-text">"{passphrase}"</p>
        </div>

        <div className="audio-controls">
          <button className="login-btn" onClick={startRecording} disabled={isRecording}>
            Start Recording
          </button>
          <button className="login-btn" onClick={stopRecording} disabled={!isRecording}>
            Stop Recording
          </button>
        </div>

        {audioURL && (
          <div className="audio-preview">
            <p>Recorded Audio:</p>
            <audio ref={audioRef} src={audioURL}></audio>
            <div className="custom-audio-controls">
              <button className="login-btn" onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
        )}

        <p className="register-link">
          Don’t have an account? <Link to="/Register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
