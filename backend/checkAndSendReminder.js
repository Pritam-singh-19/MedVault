const Reminder = require('../models/reminderModel');
const User = require('../models/userModel');
const { sendPushNotification } = require('../sendPushNotification');

// This function should be called by a scheduler (e.g., cron job) every minute
async function checkAndSendReminders() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Find all reminders that are due now
  const reminders = await Reminder.find({});
  for (const reminder of reminders) {
    // Calculate if today is within the allowed days
    const createdAt = new Date(reminder.createdAt);
    const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
    const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    if (
      diffDays >= 0 &&
      diffDays < (reminder.days || 1)
    ) {
      const [h, m] = reminder.time.split(":");
      if (Number(h) === currentHour && Number(m) === currentMinute) {
        // Get the user's FCM tokens (multi-device support)
        const user = await User.findById(reminder.user);
        if (user && user.fcmTokens && Array.isArray(user.fcmTokens)) {
          for (const token of user.fcmTokens) {
            await sendPushNotification(
              token,
              'Medicine Reminder',
              `It's time to take your medicine: ${reminder.medicine}`
            );
          }
        }
      }
    }
  }
}

module.exports = { checkAndSendReminders };
