import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceCommand.css";

const VoiceCommand = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [message, setMessage] = useState("Say: 'Open my profile', 'Show products', or 'Logout'");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser 😢");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setRecognizedText(transcript);
      handleCommand(transcript);
    };

    const handleCommand = (command) => {
      if (command.includes("profile")) {
        setMessage("Opening Profile...");
        navigate("/profile");
      } else if (command.includes("product")) {
        setMessage("Opening Products...");
        navigate("/products");
      } 
      else if(command.includes("contact us")){
        setMessage("Opening Contact Us...");
        navigate("/contact");
      }
       else if(command.includes("about us")){
        setMessage("Opening about Us...");
        navigate("/about");
      }
      else if (command.includes("logout")) {
        setMessage("Logging out...");
        localStorage.removeItem("userEmail");
        navigate("/login");
      } else {
        setMessage("Command not recognized. Try again!");
      }
    };

    const button = document.getElementById("voice-btn");
    button.onclick = () => recognition.start();
  }, [navigate]);

  return (
    
    <div className="voice-page">
      <h1>🎤 Voice Command Center</h1>
      
      <p className="welcome-text">Welcome, {localStorage.getItem("userEmail") || "User"}!</p>
      <p className="hint-text">{message}</p>

      <button id="voice-btn" className="voice-btn">
        {isListening ? "Listening..." : "🎙️ Start Listening"}
      </button>

      {recognizedText && (
        <p className="recognized">You said: "{recognizedText}"</p>
      )}
    </div>
  );
};

export default VoiceCommand;
