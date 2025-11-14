import React, { useState, useRef } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = useRef(null);

  
  const startListening = (field) => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition ");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListeningField(field);
      console.log(`🎙️ Listening for ${field}...`);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Heard:", transcript);
      if (field === "name") setName(transcript);
      if (field === "email") setEmail(transcript.replace(/\s+/g, "").toLowerCase()); 
      if (field === "message") setMessage((prev) => prev + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      alert("Error: " + event.error);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div
      name="contact"
      className="w-full h-screen bg-gradient-to-b from-black to-gray-800 p-4 text-white"
    >
      <div className="flex flex-col justify-center max-w-screen-lg mx-auto h-full">
        <div className="pb-8">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            Contact
          </p>
          <p className="py-6">
            Submit the form below or speak your details to get in touch with
            <span className="text-cyan-400 font-semibold"> VocalID!</span>
          </p>
        </div>

        <div className="flex justify-center items-center w-full">
          <form
            action="https://getform.io/f/lbjkynya"
            method="POST"
            className="flex flex-col w-full md:w-1/2"
          >
            
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 w-full bg-transparent border-2 rounded-md text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => startListening("name")}
                className={`ml-2 p-2 rounded-full border-2 ${
                  listeningField === "name"
                    ? "border-green-400 animate-pulse"
                    : "border-cyan-500"
                }`}
              >
                🎙️
              </button>
            </div>

            
            <div className="relative flex items-center gap-2 my-4">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 w-full bg-transparent border-2 rounded-md text-white focus:outline-none"
              />
              {/* <button
                type="button"
                onClick={() => startListening("email")}
                className={`ml-2 p-2 rounded-full border-2 ${
                  listeningField === "email"
                    ? "border-green-400 animate-pulse"
                    : "border-cyan-500"
                }`}
              >
                🎙️
              </button> */}
            </div>

            
            <div className="relative flex items-center gap-2">
              <textarea
                name="message"
                placeholder="Enter your message"
                rows="8"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-2 w-full bg-transparent border-2 rounded-md text-white focus:outline-none"
              ></textarea>
              <button
                type="button"
                onClick={() => startListening("message")}
                className={`ml-2 p-2 rounded-full border-2 ${
                  listeningField === "message"
                    ? "border-green-400 animate-pulse"
                    : "border-cyan-500"
                }`}
              >
                🎙️
              </button>
            </div>

            <button className="text-white bg-gradient-to-b from-cyan-500 to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md hover:scale-110 duration-300">
              Let's Talk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
