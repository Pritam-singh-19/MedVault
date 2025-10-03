const express = require('express');
const { createReminder, getReminders, markMedicineTaken, saveFCMToken } = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Mark a reminder as taken for a specific day
router.post('/:reminderId/mark-taken', authMiddleware, markMedicineTaken);

// Create a new reminder
router.post('/', authMiddleware, createReminder);

// Get all reminders for the logged-in user
router.get('/', authMiddleware, getReminders);

// NEW: Save FCM token for push notifications
router.post('/save-fcm-token', authMiddleware, saveFCMToken);

module.exports = router;