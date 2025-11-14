import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './componants/Navbar/Navbar';
import Home from './componants/Home/Home';
import Login from './componants/Login/Login';
import Products from './componants/Products/Products';
import About from './componants/About/About';
import Contact from './componants/Contact/Contact';
import Register from './componants/Register/Register';
import VoiceCommand from './componants/VoiceCommand';
const App = () => {
  const [theme, setTheme] = useState('light');

  return (
    <div className={`container ${theme}`}>
      <BrowserRouter>
        <Navbar theme={theme} setTheme={setTheme} />
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/products" element={<Products theme={theme} />} />
          <Route path="/about" element={<About theme={theme} />} />
          <Route path="/contact" element={<Contact theme={theme} />} />
           <Route path="/Login" element={<Login theme={theme} />} />
           <Route path="/Register" element={<Register theme={theme} />} />
           <Route path ="/voice-command" element={<VoiceCommand theme={theme} />} />
           
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
