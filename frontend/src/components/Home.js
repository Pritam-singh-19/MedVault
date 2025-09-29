import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import uploadIcon from "../assets/upload-icon.png";
import searchIcon from "../assets/search-icon.png";
import securityIcon from "../assets/security-icon.png";
import "./styles/Home.css";

function Home() {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleGetStartedClick = () => {
    navigate("/login"); // Navigate to the login page
  };

  const handleWatchDemoClick = () => {
    navigate("/register"); // Navigate to the register page
  };

  // Animated statistics logic
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsData = [
    { end: 10000, suffix: '+', label: 'Active Users' },
    { end: 50000, suffix: '+', label: 'Prescriptions Stored' },
    { end: 99.9, suffix: '%', label: 'Uptime', decimals: 1 },
  ];
  const [statValues, setStatValues] = useState(statsData.map(() => 0));

  useEffect(() => {
    function handleScroll() {
      if (!statsRef.current || statsAnimated) return;
      const rect = statsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setStatsAnimated(true);
      }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsAnimated, statsRef]);

  useEffect(() => {
    if (!statsAnimated) return;
    let start = null;
    const duration = 1200;
    function animateStats(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setStatValues(statsData.map((stat, i) => {
        if (stat.decimals) {
          return (progress * stat.end).toFixed(stat.decimals);
        }
        return Math.floor(progress * stat.end);
      }));
      if (progress < 1) {
        requestAnimationFrame(animateStats);
      } else {
        setStatValues(statsData.map(stat => stat.end));
      }
    }
    requestAnimationFrame(animateStats);
  }, [statsAnimated]);
    return (
      <div>
        <div className="home dark-mode">
          <header className="header">
            <h1>Secure Storage and free Medical assistant for Your</h1>
            <h2 className="highlight">Medical Prescriptions</h2>
            <p>
              Store, organize, and access your medical prescriptions securely from anywhere. 
              Never worry about losing important medical documents again.
            </p>
            <div className="buttons">
              <button className="btn get-started" onClick={handleGetStartedClick}>
                Get Started
              </button>
              <button className="btn watch-demo" onClick={handleWatchDemoClick}>
                Create Your Account Now
              </button>
            </div>
          </header>

          {/* about chat bot  */}

          <section className="chat-bot">
            <div className="chat-bot-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h2>Your personal chat assistant</h2>
            <p>
              <strong><span className="highlight">who will assist you when you get stucked with understanding the report</span></strong> 
            </p>
          </section>

          {/* Ready to Get Started Section */}
          <section className="lets-start">
            <h2>
              <i className="fas fa-rocket"></i> Ready to Get Started?
            </h2>
            <p>
              <strong>Join thousands of users</strong> who trust <span className="brand-name">MedVault</span> with their medical prescriptions.  
              <br /> Start organizing your prescriptions <span className="highlight">effortlessly</span> today!
            </p>
            <button className="btn-create-account" onClick={handleWatchDemoClick}>
              Create Free Account <i className="fas fa-user-plus"></i>
            </button>
          </section>

          {/* Why Choose Us Section */}
          <section className="why-choose">
            <h1>Why   Choose   MedVault  ?</h1>
            <div className="features">
              <div className="feature">
                <img src={uploadIcon} alt="Upload Icon" className="feature-icon" />
                <h3>Easy Upload</h3>
                <p>Upload prescriptions quickly by taking a photo or uploading a document. Supports multiple file formats.</p>
              </div>
              <div className="feature">
                <img src={searchIcon} alt="Search Icon" className="feature-icon" />
                <h3>Smart Search</h3>
                <p>Find any prescription instantly with our powerful search and filter system.</p>
              </div>
              <div className="feature">
                <img src={securityIcon} alt="Security Icon" className="feature-icon" />
                <h3>Bank-Level Security</h3>
                <p>Your medical data is protected with enterprise-grade encryption and security measures.</p>
              </div>
            </div>

            {/* Statistics Box with animated numbers */}
            <div className="statistics-box" ref={statsRef}>
              {statsData.map((stat, i) => (
                <div className="stat" key={stat.label}>
                  <h3>
                    {statValues[i]}
                    {stat.suffix}
                  </h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Section */}
          <footer className="footer">
            <div className="footer-container">
              <div className="footer-section">
                <h4>About MedVault</h4>
                <ul>
                  <li><span style={{cursor:'pointer'}}>Our Mission</span></li>
                  <li><span style={{cursor:'pointer'}}>Privacy Policy</span></li>
                  <li><span style={{cursor:'pointer'}}>Terms of Service</span></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><span style={{cursor:'pointer'}}>Help Center</span></li>
                  <li><span style={{cursor:'pointer'}}>FAQs</span></li>
                  <li><span style={{cursor:'pointer'}}>Contact Us</span></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><span style={{cursor:'pointer'}}>Dashboard</span></li>
                  <li><span style={{cursor:'pointer'}}>My Prescriptions</span></li>
                  <li><span style={{cursor:'pointer'}}>Upload Prescription</span></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="https://www.instagram.com/pritamsingh1903"> <i className="fab fa-instagram"></i></a>
                  <a href="https://www.linkedin.com/in/pritam-singh-40044428a" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2025 MedVault. All Rights Reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    );
}

export default Home;
