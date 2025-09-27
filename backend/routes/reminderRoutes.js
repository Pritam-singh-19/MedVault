const express = require('express');
const { createReminder, getReminders } = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new reminder
router.post('/', authMiddleware, createReminder);

// Get all reminders for the logged-in user
router.get('/', authMiddleware, getReminders);

module.exports = router;
