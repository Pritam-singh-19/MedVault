import React, { useState, useEffect } from "react";
import { messaging, getToken } from "./firebase";
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
import ExplainReport from "./pages/ExplainReport";
import ReminderForm from "./components/ReminderForm";
import axios from "axios";

// Register FCM service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(function(registration) {
        console.log('FCM Service Worker registered with scope:', registration.scope);
      })
      .catch(function(err) {
        console.log('FCM Service Worker registration failed:', err);
      });
  });
}

function App() {
  // Move all useState declarations to the top
  const [fcmToken, setFcmToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);

  // Request notification permission and get FCM token
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, { vapidKey: 'BLXqt2LSD9-k1eoxtR5WTtlyZhHtx043_ZYSYespLkt6UfWCqi5ZIrzY3Ei0v0o1jtqXHnrzalTEkj2sT4_UHqw' })
          .then((currentToken) => {
            if (currentToken) {
              setFcmToken(currentToken);
              console.log('✅ FCM Token obtained:', currentToken.substring(0, 50) + '...');
            } else {
              console.log('❌ No FCM token available. Request permission to generate one.');
            }
          })
          .catch((err) => {
            console.log('❌ Error retrieving FCM token:', err);
          });
      } else {
        console.log('❌ Notification permission denied');
      }
    });
  }, []);

  // Send FCM token to backend when authenticated and token is available
  useEffect(() => {
    const sendFcmToken = async () => {
      if (isAuthenticated && fcmToken) {
        const token = localStorage.getItem("token");
        try {
          // FIXED: Use the correct endpoint for reminders
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reminders/save-fcm-token`,
            { fcmToken },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("✅ FCM token sent to backend successfully:", response.data);
        } catch (err) {
          console.error("❌ Failed to send FCM token to backend:", err.response?.data || err.message);
        }
      }
    };
    sendFcmToken();
  }, [isAuthenticated, fcmToken]);

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

  // Fetch reminders from backend on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reminders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Handle both array and object responses
        const remindersData = res.data.reminders || res.data || [];
        setReminders(remindersData);
      } catch (err) {
        console.error("❌ Failed to fetch reminders:", err);
      }
    };
    fetchReminders();
    const pollInterval = setInterval(fetchReminders, 60000); // Poll every 60 seconds
    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

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
    setReminders([]);
    setFcmToken(null); // Clear FCM token on logout
  };

  // Pass reminders and setReminders to ReminderForm for refetch after submit
  return (
    <Router>
      <AppContent 
        isAuthenticated={isAuthenticated} 
        user={user} 
        handleSignIn={handleSignIn} 
        handleSignOut={handleSignOut} 
        reminders={reminders}
        setReminders={setReminders}
      />
    </Router>
  );
}

function AppContent({ isAuthenticated, user, handleSignIn, handleSignOut, reminders, setReminders }) {
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
        <Route path="/explain-report" element={isAuthenticated ? <ExplainReport /> : <Navigate to="/login" replace />} />
        <Route path="/reminder" element={<ReminderForm reminders={reminders} setReminders={setReminders} onSetReminder={() => {}} />} />
      </Routes>
    </>
  );
}

export default App;