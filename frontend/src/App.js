import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Home from "./components/Home";
import UserHome from "./components/UserHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionDetail from "./pages/PrescriptionDetails";
import ImageViewerPage from "./pages/ImageViewerPage"; 
import Navbar from "./components/Navbar";
import Navbar2 from "./components/Navbar2";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleSignIn = (token, userData) => {
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <AppContent 
        isAuthenticated={isAuthenticated} 
        user={user} 
        handleSignIn={handleSignIn} 
        handleSignOut={handleSignOut} 
      />
    </Router>
  );
}

function AppContent({ isAuthenticated, user, handleSignIn, handleSignOut }) {
  const location = useLocation();

  const showDefaultNavbar = !isAuthenticated && 
    (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register");

  return (
    <>
      {isAuthenticated ? <Navbar handleSignOut={handleSignOut} /> : showDefaultNavbar && <Navbar2 />}

      <Routes>
        {/* Redirect Home to UserHome when logged in */}
        <Route path="/" element={isAuthenticated ? <UserHome user={user} /> : <Home />} />
        
        {/* Check if already authenticated, then redirect to home */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login setIsAuthenticated={handleSignIn} />} 
        />
        
        <Route path="/register" element={<Register setIsAuthenticated={handleSignIn} />} />
        <Route path="/image-viewer" element={<ImageViewerPage />} />
        
        {/* Redirect user to UserHome after login instead of Profile */}
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
        
        <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/login" replace />} />
        <Route path="/prescriptions" element={isAuthenticated ? <Prescriptions /> : <Navigate to="/login" replace />} />
        <Route path="/prescriptions/:folderName" element={isAuthenticated ? <PrescriptionDetail /> : <Navigate to="/login" replace />} /> 
      </Routes>
    </>
  );
}

export default App;
