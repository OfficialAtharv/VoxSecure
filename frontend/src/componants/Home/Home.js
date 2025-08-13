import React from "react";
import "./Home.css";
import Footer from '../Footer/Footer.js'
import { IoMicCircleOutline } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { RiSpeakAiFill } from "react-icons/ri";
import { BsFillShieldLockFill } from "react-icons/bs";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaFingerprint } from "react-icons/fa";
import { TbPasswordMobilePhone } from "react-icons/tb";
import { IoIosLock } from "react-icons/io";
const Home = () => {
  return (
    <div>
      <h1 className="heading">Your Voice. Your Password. </h1>
      <h3 className="subheading">
        VocalID is a next-generation security system that authenticates users
        based on their unique voiceprint,offering a seamless and secure login
        experience.
      </h3>
      <div className="cta-button-container">
        <button className="cta-button">
          <span>Record Your Voice</span>
          <IoMicCircleOutline className="cta-icon" />
        </button>
      </div>
      <div>
        <h2 className="subheading2">
          How It Works
          <BsPersonWorkspace
            className="
      subheadingicon"
          />
        </h2>
      </div>
      <div className="working">
        <div className="work1">
          <FaMicrophone className="work-icon" />
          <h3 className="work-title">1. Enroll Your Voice</h3>
          <p className="work-desc">
            Speak a passphrase to create your unique voiceprint.
          </p>
        </div>
        <div className="work1">
          <RiSpeakAiFill className="work-icon" />
          <h3 className="work-title">2. Login with Your Voice</h3>
          <p className="work-desc">
            Speak your passphrase to verify your identity in real-time.
          </p>
        </div>
        <div className="work1">
          <BsFillShieldLockFill className="work-icon" />
          <h3 className="work-title">3. Access Granted</h3>
          <p className="work-desc">Instant, secure access without passwords.</p>
        </div>
      </div>

      <div>
        <div>
          <h2 className="subheading2">
            Why Choose VocalID <FaCircleQuestion className="subheadingicon" />
          </h2>
        </div>
        <div className="mb-5">
          <div className="working">
            <div className="work1">
              <FaFingerprint  className="work-icon" />
              <h3 className="work-title">Unmatched Security</h3>
              <p className="work-desc">
                Voiceprint are unique and cannot be stolen.
              </p>
            </div>
            <div className="work1">
              <TbPasswordMobilePhone  className="work-icon" />
              <h3 className="work-title">Password free convenience.</h3>
              <p className="work-desc">
                Say Goodbye to forgotten password. Your Voice is all you need.
              </p>
            </div>
            <div className="work1">
              <IoIosLock className="work-icon" />
              <h3 className="work-title">Hight Accuracy</h3>
              <p className="work-desc">
                Our ML models are turned to be reliable identify you,minizing erros.
              </p>
            </div>
          </div>
        </div>
      </div>

        <Footer/>




    </div>
  );
};

export default Home;
