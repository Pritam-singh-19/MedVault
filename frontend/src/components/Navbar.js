
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFilePrescription, faUpload, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/Medvault-logo.png';
import "./styles/Navbar.css";

function Navbar({ handleSignOut, isLoggedIn }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const signOut = () => {
    handleSignOut();
    navigate("/login", { replace: true });
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <img src={logo} alt="MedVault Logo" className="navbar-logo-img" />
      <div className="navbar-dropdown" ref={dropdownRef}>
        <button className="navbar-dropdown-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {dropdownOpen && (
          <ul className="navbar-dropdown-menu">
            <li>
              <Link to={isLoggedIn ? "/userhome" : "/"} onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faHome} /> Home
              </Link>
            </li>
            <li>
              <Link to="/prescriptions" onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faFilePrescription} /> Prescriptions
              </Link>
            </li>
            <li>
              <Link to="/upload" onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faUpload} /> Upload
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faUser} /> Profile
              </Link>
            </li>
            <li>
              <button onClick={signOut} className="signout">Sign Out</button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
