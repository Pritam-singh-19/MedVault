import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFilePrescription, faUpload, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/Medvault-logo.png';
import "./styles/Navbar.css";

function Navbar({ handleSignOut, isLoggedIn }) {
  const navigate = useNavigate();

  const signOut = () => {
    handleSignOut();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="MedVault Logo" className="navbar-logo" />

      <ul className="navbar-links">
        <li>
          <Link to={isLoggedIn ? "/userhome" : "/"}>
            <FontAwesomeIcon icon={faHome} /> Home
          </Link>
        </li>
        <li><Link to="/prescriptions"><FontAwesomeIcon icon={faFilePrescription} /> Prescriptions</Link></li>
        <li><Link to="/upload"><FontAwesomeIcon icon={faUpload} /> Upload</Link></li>
        <li><Link to="/profile"><FontAwesomeIcon icon={faUser} /> Profile</Link></li>

        <li><button onClick={signOut} className="signout">Sign Out</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
