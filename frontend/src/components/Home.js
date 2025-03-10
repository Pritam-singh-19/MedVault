import React from "react";
import uploadIcon from "../assets/upload-icon.png";
import searchIcon from "../assets/search-icon.png";
import securityIcon from "../assets/security-icon.png";
import "./styles/Home.css";

function Home() {
  return (
    <div className="home dark-mode">
      <header className="header">
        <h1>Secure Storage for Your</h1>
        <h2 className="highlight">Medical Prescriptions</h2>
        <p>
          Store, organize, and access your medical prescriptions securely from anywhere. 
          Never worry about losing important medical documents again.
        </p>
        <div className="buttons">
          <button className="btn get-started">Get Started</button>
          <button className="btn watch-demo">Create Your Account Now </button>
        </div>
      </header>

      {/* Ready to Get Started Section */}
      <section className="lets-start">
        <h2>
          <i className="fas fa-rocket"></i> Ready to Get Started?
        </h2>
        <p>
          <strong>Join thousands of users</strong> who trust <span className="brand-name">MedVault</span> with their medical prescriptions.  
          <br /> Start organizing your prescriptions <span className="highlight">effortlessly</span> today!
        </p>
        <button className="btn-create-account">
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

        {/* Statistics Box */}
        <div className="statistics-box">
          <div className="stat">
            <h3>10K+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat">
            <h3>50K+</h3>
            <p>Prescriptions Stored</p>
          </div>
          <div className="stat">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>About MedVault</h4>
            <ul>
              <li><a href="#">Our Mission</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">My Prescriptions</a></li>
              <li><a href="#">Upload Prescription</a></li>
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
  );
}

export default Home;
