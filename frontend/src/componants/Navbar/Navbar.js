import React from "react";
import "./Navbar.css";
import logo_light from "../../assets/logo-black.png";
import { NavLink } from "react-router-dom";
import logo_dark from "../../assets/logo-white.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import search_icon_light from "../../assets/search-w.png";
import our_logo1 from "../../assets/bg_img.png";
import search_icon_dark from "../../assets/search-b.png";
import toggle_light from "../../assets/night.png";
import toggle_dark from "../../assets/day.png";
import { AiOutlineLogin } from "react-icons/ai";
const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const toggle_mode = () => {
    theme == "light" ? setTheme("dark") : setTheme("light");
  };
  return (
    <div className="navbar">
      <img
        src={theme == "light" ? our_logo1 : our_logo1}
        alt=""
        className="logo"
      />
      <ui>
        <li>
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className="nav-link">
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className="nav-link">
            Contact Us
          </NavLink>
        </li>
      </ui>
      <div className="search-box">
        <input type="text" placeholder="Search" />
        <img
          src={theme == "light" ? search_icon_light : search_icon_dark}
          alt=""
        />
      </div>
      <img
        src={theme == "light" ? toggle_light : toggle_dark}
        onClick={() => {
          toggle_mode();
        }}
        className="toggle-icon"
      />
      <button
        type="button"
        onClick={() => navigate("/Login")}
        className="flex items-center gap-2 py-2 px-9 me-2 mb-1 mt-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      >
        <AiOutlineLogin />
        Login
      </button>
    </div>
  );
};

export default Navbar;
