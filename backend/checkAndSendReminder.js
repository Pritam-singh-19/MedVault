const Reminder = require('./models/reminderModel');
const User = require('./models/userModel');
const { sendPushNotification } = require('./sendPushNotification');

// This function should be called by a scheduler (e.g., cron job) every minute
async function checkAndSendReminders() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log('⏰ checkAndSendReminders running at', now.toISOString());
  console.log(`🕐 Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
  
  // Find all reminders that are due now
  const reminders = await Reminder.find({});
  console.log(`🔎 Found ${reminders.length} reminders in DB.`);
  let dueCount = 0;
  let sentCount = 0;
  
  for (const reminder of reminders) {
    console.log(`🔍 Checking reminder: ${reminder.medicine} at ${reminder.time} (created: ${new Date(reminder.createdAt).toLocaleDateString()})`);
    
    // Calculate if today is within the allowed days
    const createdAt = new Date(reminder.createdAt);
    const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
    const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Day ${diffDays + 1} of ${reminder.days || 1} days`);
    
    if (
      diffDays >= 0 &&
      diffDays < (reminder.days || 1)
    ) {
      const [h, m] = reminder.time.split(":");
      const reminderHour = Number(h);
      const reminderMinute = Number(m);
      
      console.log(`🕐 Reminder time: ${reminderHour}:${reminderMinute.toString().padStart(2, '0')}, Current: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
      
      if (reminderHour === currentHour && reminderMinute === currentMinute) {
        console.log(`📬 Reminder due NOW: ${reminder.medicine} for user ${reminder.user}`);
        dueCount++;
        
        // Get the user's FCM tokens (multi-device support)
        const user = await User.findById(reminder.user);
        if (user && user.fcmTokens && Array.isArray(user.fcmTokens)) {
          console.log(`👤 Found user with ${user.fcmTokens.length} FCM tokens`);
          for (const token of user.fcmTokens) {
            console.log(`➡️ Sending push to token: ${token.substring(0, 20)}...`);
            try {
              await sendPushNotification(
                token,
                'Medicine Reminder',
                `It's time to take your medicine: ${reminder.medicine}`
              );
              sentCount++;
              console.log(`✅ Notification sent successfully`);
            } catch (error) {
              console.error(`❌ Failed to send notification:`, error.message);
            }
          }
        } else {
          console.log(`⚠️ No FCM tokens found for user ${reminder.user}`);
        }
      } else {
        console.log(`⏳ Not due yet (time mismatch)`);
      }
    } else {
      console.log(`📅 Not in active days range (day ${diffDays + 1} not within ${reminder.days || 1} days)`);
    }
  }
  
  console.log(`📊 Summary: ${dueCount} reminders due, ${sentCount} notifications sent`);
}

module.exports = { checkAndSendReminders };
