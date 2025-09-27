const Reminder = require('../models/reminderModel');

// Create a new reminder
const createReminder = async (req, res) => {
  try {
    const { medicine, time } = req.body;
    const userId = req.user.id; // Assumes user is authenticated
    if (!medicine || !time) {
      return res.status(400).json({ message: 'Medicine and time are required.' });
    }
    const reminder = new Reminder({ user: userId, medicine, time });
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

module.exports = { createReminder, getReminders };
