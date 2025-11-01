import React from "react";
import "./Products.css";
import { FaMicrophoneAlt, FaShieldAlt, FaBrain } from "react-icons/fa";
import bgGif from "../../assets/bg.gif";

const Products = () => {
  const products = [
    {
      title: "VoxAuth",
      icon: <FaMicrophoneAlt />,
      desc: "Voice-based authentication system providing secure and seamless access.",
    },
    {
      title: "VoxShield",
      icon: <FaShieldAlt />,
      desc: "Protect your data with advanced voice encryption and fraud detection.",
    },
    {
      title: "VoxAI Engine",
      icon: <FaBrain />,
      desc: "AI-powered engine that learns and adapts to unique voice patterns.",
    },
  ];

  return (
    <div className="products-page">
      <div
        className="products-bg"
        style={{ backgroundImage: `url(${bgGif})` }}
      ></div>

      <div className="products-container">
        <h1 className="products-title">Our Products</h1>
        <p className="products-subtitle">
          Explore our intelligent and secure voice-based solutions.
        </p>

        <div className="products-grid">
          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <div className="product-icon">{product.icon}</div>
              <h3>{product.title}</h3>
              <p>{product.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
