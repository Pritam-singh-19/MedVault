import { messaging, getToken } from "./firebase";
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
import ExplainReport from "./pages/ExplainReport";
import ReminderForm from "./components/ReminderForm";

import axios from "axios";

function App() {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, { vapidKey: 'BLXqt2LSD9-k1eoxtR5WTtlyZhHtx043_ZYSYespLkt6UfWCqi5ZIrzY3Ei0v0o1jtqXHnrzalTEkj2sT4_UHqw' })
          .then((currentToken) => {
            if (currentToken) {
              // Send this token to your backend and save it for the user
              console.log('FCM Token:', currentToken);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          })
          .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
          });
      }
    });
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);

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
          `${process.env.REACT_APP_API_URL}/api/reminders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReminders(res.data);
      } catch (err) {}
    };
    fetchReminders();
    const pollInterval = setInterval(fetchReminders, 60000); // Poll every 60 seconds
    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

  // Periodically check reminders and show notification
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("Notification" in window)) return;
    Notification.requestPermission();
    let notified = {};
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      reminders.forEach((reminder) => {
        const [h, m] = reminder.time.split(":");
        const reminderHour = Number(h);
        const reminderMinute = Number(m);
        const key = `${reminder._id || reminder.medicine}-${reminder.time}`;
        // Check if today is within the allowed days
        const createdAt = new Date(reminder.createdAt);
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
        const diffDays = Math.floor((nowDate - createdDate) / (1000 * 60 * 60 * 24));
        if (
          diffDays >= 0 &&
          diffDays < (reminder.days || 1) &&
          currentHour === reminderHour &&
          currentMinute === reminderMinute &&
          !notified[key]
        ) {
          if (Notification.permission === "granted") {
            new Notification(`Medicine Reminder`, {
              body: `It's time to take your medicine: ${reminder.medicine}`,
              icon: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
            });
            notified[key] = true;
          }
        }
        if (currentMinute !== reminderMinute) {
          notified[key] = false;
        }
      });
    }, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [reminders, isAuthenticated]);

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
