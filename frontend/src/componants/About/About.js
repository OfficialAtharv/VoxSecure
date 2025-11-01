import React from "react";
import { motion } from "framer-motion";
import "./About.css";
import { FaMicrophoneAlt, FaLock, FaUsers, FaBrain } from "react-icons/fa";
import bgGif from "../../assets/bg.gif";

const About = () => {
  return (
    <div className="about-page">
      {/* Animated Background */}
      <div
        className="about-background"
        style={{ backgroundImage: `url(${bgGif})` }}
      ></div>

      <div className="about-content">
        {/* Title Section */}
        <motion.h1
          className="about-title fancy-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About VoxSecure
        </motion.h1>

        {/* Description */}
        <motion.p
          className="about-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          VoxSecure is an advanced authentication platform built to redefine
          digital security through the **power of your voice**. Using deep
          learning and real-time biometric voice analysis, VoxSecure ensures
          that access is **unique, fast, and human** — no passwords, no patterns,
          just **you**.
        </motion.p>

        {/* Features Section */}
        <div className="about-features">
          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaMicrophoneAlt className="feature-icon" />
            <h3>Voice Recognition</h3>
            <p>
              Our AI captures over 100 unique vocal traits — tone, pitch, and
              rhythm — to identify your voice with precision.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaLock className="feature-icon" />
            <h3>Top-Tier Security</h3>
            <p>
              We combine encryption and biometric modeling to ensure your voice
              data stays private and protected.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaBrain className="feature-icon" />
            <h3>AI-Powered Intelligence</h3>
            <p>
              VoxSecure constantly learns and adapts to enhance accuracy even in
              noisy or changing environments.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaUsers className="feature-icon" />
            <h3>Built for Everyone</h3>
            <p>
              Designed for developers, businesses, and individuals who value
              innovation and seamless authentication.
            </p>
          </motion.div>
        </div>

        {/* Closing Message */}
        <motion.p
          className="about-tagline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          🔐 Your Voice. Your Identity. Your Security.
        </motion.p>
      </div>
    </div>
  );
};

export default About;
