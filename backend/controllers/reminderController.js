const Reminder = require('../models/reminderModel');

// Create a new reminder
const createReminder = async (req, res) => {
  try {
  const { medicine, time, days } = req.body;
    const userId = req.user.id; // Assumes user is authenticated
    if (!medicine || !time || !days || days < 1) {
      return res.status(400).json({ message: 'Medicine, time, and valid days are required.' });
    }
    const reminder = new Reminder({ user: userId, medicine, time, days });
    await reminder.save();
    res.status(201).json({ message: 'Reminder created successfully', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reminders for a user
const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await Reminder.find({ user: userId });
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark medicine as taken for a specific day
const markMedicineTaken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reminderId } = req.params;
    const { date } = req.body; // Expecting date as 'YYYY-MM-DD'
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
    const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }
    reminder.takenHistory.set(date, true);
    await reminder.save();
    res.status(200).json({ message: 'Marked as taken', takenHistory: reminder.takenHistory });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReminder, getReminders, markMedicineTaken };
