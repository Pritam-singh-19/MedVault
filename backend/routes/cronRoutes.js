const express = require('express');
const { checkAndSendReminders } = require('../checkAndSendReminder');
const router = express.Router();

// Unprotected endpoint for Render cron job to trigger reminders
router.post('/trigger-reminders', async (req, res) => {
  console.log('🔔 /api/cron/trigger-reminders endpoint called at', new Date().toISOString());
  try {
    await checkAndSendReminders();
    res.status(200).json({ message: 'Reminders checked and notifications sent (if due).' });
  } catch (error) {
    console.error('Error in /api/cron/trigger-reminders:', error);
    res.status(500).json({ error: 'Failed to check/send reminders.' });
  }
});

module.exports = router;
