import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/UserHome.css";
import medvaultLogo from "../assets/Medvault-logo.png";

const ReminderForm = ({ onSetReminder, reminders, setReminders }) => {
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [days, setDays] = useState(''); // Number of days for the reminder
  const [message, setMessage] = useState("");
  const [localReminders, setLocalReminders] = useState([]);

  // Use passed reminders or fetch them locally
  const displayReminders = reminders || localReminders;

  // Fetch reminders from backend on mount and periodically
  useEffect(() => {
    if (reminders) return; // If reminders are passed as props, don't fetch

    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reminders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Handle both array and object responses
        const remindersData = res.data.reminders || res.data || [];
        setLocalReminders(remindersData);
      } catch (err) {
        console.error("❌ Failed to fetch reminders:", err);
      }
    };
    fetchReminders();
    const pollInterval = setInterval(fetchReminders, 60000); // Poll every 60 seconds
    return () => clearInterval(pollInterval);
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
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reminders`,
        { medicine, time, days: Number(days) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setMessage("✅ Reminder set successfully!");
        onSetReminder({ medicine, time, days });
        setMedicine("");
        setTime("");
        setDays('');
        
        // Refetch reminders after setting a new one
        const fetchReminders = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reminders`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const remindersData = res.data.reminders || res.data || [];
            if (setReminders) {
              setReminders(remindersData);
            } else {
              setLocalReminders(remindersData);
            }
          } catch (err) {
            console.error("❌ Failed to refetch reminders:", err);
          }
        };
        fetchReminders();
      } else {
        setMessage(res.data.message || "❌ Failed to set reminder.");
      }
    } catch (err) {
      console.error("❌ Error setting reminder:", err);
      setMessage("❌ Failed to set reminder.");
    }
  };

  return (
    <div className="user-home">
      <div className="cards-container">
        <div className="home-card">
          <h3>💊 Set Medicine Reminder</h3>

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
            <button type="submit">🔔 Set Reminder</button>
          </form>

          {/* ✅ Feedback message */}
          {message && <p style={{ 
            color: message.includes('✅') ? 'green' : 'red',
            fontWeight: 'bold' 
          }}>{message}</p>}

          {/* ✅ Display current reminders */}
          {displayReminders.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>📋 Your Reminders:</h4>
              {displayReminders.map((reminder, index) => (
                <div key={reminder._id || index} style={{
                  background: '#f5f5f5',
                  padding: '10px',
                  margin: '5px 0',
                  borderRadius: '5px'
                }}>
                  <strong>💊 {reminder.medicine}</strong><br />
                  <span>⏰ {reminder.time}</span><br />
                  <span>📅 {reminder.days} day(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderForm;