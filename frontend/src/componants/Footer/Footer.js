import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = ({ theme }) => {
  const isLight = theme === "light";

  return (
    <footer
      className={`w-full px-8 py-10 ${
        isLight
          ? "bg-gray-100 text-gray-700 border-t border-gray-200"
          : "bg-gray-900 text-gray-300 border-t border-gray-700"
      }`}
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        {/* Brand Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold">VocalID</h2>
          <p>
            Empowering secure login through your voiceprint — because your voice is your password.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Quick Links</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">Products</a>
            <a href="#" className="hover:underline">About Us</a>
            <a href="#" className="hover:underline">Contact Us</a>
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Legal</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
            <li><a href="#" className="hover:underline">Help Center</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Contact</h3>
          <p className="flex items-center gap-2">
            <FaEnvelope /> support@vocalid.com
          </p>
          <p className="flex items-center gap-2">
            <FaPhone /> +91 98765 43210
          </p>
          <div className="flex gap-4 pt-2 text-lg">
            <a href="#" className="hover:text-blue-500"><FaFacebookF /></a>
            <a href="#" className="hover:text-sky-400"><FaTwitter /></a>
            <a href="#" className="hover:text-blue-600"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-10 opacity-70">
        &copy; {new Date().getFullYear()} VocalID. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
