import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/Medvault-logo.png';
import "./styles/Navbar2.css";

function Navbar2() {
  return (
    <nav className="navbar">
         <img src={logo} alt="MedVault Logo" className="navbar-logo" />
      <ul className="navbar-links">
        <li><Link to="/"><FontAwesomeIcon icon={faHome} /> Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar2;
