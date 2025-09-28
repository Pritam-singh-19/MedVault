import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/UserHome.css";
import medvaultLogo from "../assets/Medvault-logo.png";


const ReminderForm = ({ onSetReminder }) => {
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [days, setDays] = useState(''); // Number of days for the reminder
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

    let intervalId;
    function checkReminders() {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      reminders.forEach((reminder) => {
        const [h, m] = reminder.time.split(":");
        const reminderHour = Number(h);
        const reminderMinute = Number(m);
  // const key = `${reminder._id || reminder.medicine}-${reminder.time}`;
        // Check if today is within the allowed days
        const createdAt = new Date(reminder.createdAt);
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
        const diffDays = Math.floor((nowDate - createdDate) / (1000 * 60 * 60 * 24));
        // Unique key for this reminder and date
        if (
          diffDays >= 0 &&
          diffDays < (reminder.days || 1) &&
          currentHour === reminderHour &&
          currentMinute === reminderMinute
        ) {
          if (Notification.permission === "granted") {
            new Notification(`Medicine Reminder`, {
              body: `It's time to take your medicine: ${reminder.medicine}`,
              icon: medvaultLogo,
            });
          }
        }
      });
    }

    // Align to the next minute
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    const timeoutId = setTimeout(() => {
      checkReminders();
      intervalId = setInterval(checkReminders, 60000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [reminders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicine || !time || !days || Number(days) < 1) {
      setMessage("⚠️ Please enter medicine name, time, and valid number of days.");
      return;
    }
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reminders`,
  { medicine, time, days: Number(days) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        setMessage("✅ Reminder set!");
  onSetReminder({ medicine, time, days });
  setMedicine("");
  setTime("");
  setDays('');
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

            <input
              type="number"
              min="1"
              placeholder="Number of days (e.g. 5)"
              value={days}
              onChange={e => setDays(e.target.value)}
              required
              style={{ margin: '8px 0', width: '92%' }}
            />
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
