const Reminder = require('./models/reminderModel');
const User = require('./models/userModel');
const { sendPushNotification } = require('./sendPushNotification');

// This function should be called by a scheduler (e.g., cron job) every minute
async function checkAndSendReminders() {
  // Get current time in IST (India Standard Time)
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
  const currentHour = nowIST.getHours();
  const currentMinute = nowIST.getMinutes();
  const today = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());

  console.log('⏰ checkAndSendReminders running at', nowUTC.toISOString(), '(UTC)');
  console.log('🇮🇳 IST time:', nowIST.toISOString());
  console.log(`🕐 Current IST time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
  
  // Find all reminders that are due now
  const reminders = await Reminder.find({});
  console.log(`🔎 Found ${reminders.length} reminders in DB.`);
  let dueCount = 0;
  let sentCount = 0;
  
  for (const reminder of reminders) {
    console.log(`🔍 Checking reminder: ${reminder.medicine} at ${reminder.time} (created: ${new Date(reminder.createdAt).toLocaleDateString()})`);
    
    // Calculate if today is within the allowed days (using IST)
    const createdAtUTC = new Date(reminder.createdAt);
    const createdAtIST = new Date(createdAtUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const createdDate = new Date(createdAtIST.getFullYear(), createdAtIST.getMonth(), createdAtIST.getDate());
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
