import React, { useState } from "react";
import "./styles/UserHome.css";
import { motion } from "framer-motion"; 
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePrescription, faUpload, faUser, faBell, faCommentDots, faTimes } from "@fortawesome/free-solid-svg-icons";
import ChatBot from "./Chatbot";

function UserHome({ user }) {
  const [showChatbot, setShowChatbot] = useState(false);
  return (
    <div className="user-home">
      <motion.div 
        className="welcome-section"
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
      >
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Your digital prescription vault is ready for you!</p>
      </motion.div>

      <motion.div 
        className="cards-container"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.3 }}
      >
        <Link to="/prescriptions" className="home-card">
          <FontAwesomeIcon icon={faFilePrescription} />
          <h3>View Prescriptions</h3>
          <p>Access all your medical prescriptions in one place.</p>
        </Link>

        <Link to="/upload" className="home-card">
          <FontAwesomeIcon icon={faUpload} />
          <h3>Upload New</h3>
          <p>Upload and store your new prescriptions securely.</p>
        </Link>

        <Link to="/profile" className="home-card">
          <FontAwesomeIcon icon={faUser} />
          <h3>My Profile</h3>
          <p>Manage your account and personal details.</p>
        </Link>

        {/* ✅ New Reminder Card */}
        <Link to="/reminder" className="home-card">
          <FontAwesomeIcon icon={faBell} />
          <h3>Set Reminder</h3>
          <p>Get notified when it’s time to take your medicine.</p>
        </Link>
      </motion.div>

      {/* Floating Chatbot Button */}
      <button
        className="floating-chat-btn"
        onClick={() => setShowChatbot(true)}
        aria-label="Open Chatbot"
      >
        <FontAwesomeIcon icon={faCommentDots} size="2x" />
      </button>

      {/* Chatbot Popup/Modal */}
      {showChatbot && (
        <div className="chatbot-popup">
          <div className="chatbot-popup-header">
            <span>MedVault Chatbot</span>
            <button className="chatbot-close-btn" onClick={() => setShowChatbot(false)} aria-label="Close Chatbot">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <ChatBot />
        </div>
      )}
    </div>
  );
}

export default UserHome;
