import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/UserHome.css";
import medvaultLogo from "../assets/Medvault-logo.png";


const ReminderForm = ({ onSetReminder }) => {
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [reminders, setReminders] = useState([]);

  // Fetch reminders from backend on mount and periodically
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reminders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReminders(res.data);
      } catch (err) {
        // Ignore fetch errors for now
      }
    };
    fetchReminders();
    const pollInterval = setInterval(fetchReminders, 60000); // Poll every 60 seconds
    return () => clearInterval(pollInterval);
  }, []);

  // Periodically check reminders and show notification
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
    // Track which reminders have already triggered for this minute
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
        // If time matches (same hour and minute) and not already notified in this interval
        if (
          currentHour === reminderHour &&
          currentMinute === reminderMinute &&
          !notified[key]
        ) {
if (Notification.permission === "granted") {
  new Notification(`Medicine Reminder`, {
    body: `It's time to take your medicine: ${reminder.medicine}`,
    icon: medvaultLogo, // MedVault logo as notification icon
  });
  notified[key] = true;
}
        }
        // Reset notification flag if minute has passed
        if (currentMinute !== reminderMinute) {
          notified[key] = false;
        }
      });
    }, 15000); // Check every 15 seconds for better reliability
    return () => clearInterval(interval);
  }, [reminders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicine || !time) {
      setMessage("⚠️ Please enter both medicine name and time.");
      return;
    }
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reminders`,
        { medicine, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        setMessage("✅ Reminder set!");
        onSetReminder({ medicine, time });
        setMedicine("");
        setTime("");
        // Refetch reminders after setting a new one
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
      } else {
        setMessage(res.data.message || "Failed to set reminder.");
      }
    } catch (err) {
      setMessage("Failed to set reminder.");
    }
  };

  return (
    <div className="user-home">
      <div className="cards-container">
        <div className="home-card">
          <h3>Set Medicine Reminder</h3>

          {/* ✅ The form with inputs + time + button */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Medicine Name"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              required
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <select
              value={
                time
                  ? parseInt(time.split(":")[0], 10) < 12
                    ? "AM"
                    : "PM"
                  : "AM"
              }
              onChange={(e) => {
                // Convert time to AM/PM
                let [h, m] = time.split(":");
                if (e.target.value === "PM" && h < 12)
                  h = String(Number(h) + 12).padStart(2, "0");
                if (e.target.value === "AM" && h >= 12)
                  h = String(Number(h) - 12).padStart(2, "0");
                setTime(h + ":" + m);
              }}
              style={{ marginLeft: 8 }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>

            <button type="submit">Set Reminder</button>
          </form>

          {/* ✅ Feedback message */}
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReminderForm;
