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
  console.log('🇮🇳 IST time:', nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  console.log(`🕐 Current IST time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
  
  // Find all reminders that are due now
  const reminders = await Reminder.find({});
  console.log(`🔎 Found ${reminders.length} reminders in DB.`);
  let dueCount = 0;
  let sentCount = 0;
  
  for (const reminder of reminders) {
    console.log(`\n🔍 Checking reminder: "${reminder.medicine}" at ${reminder.time} for ${reminder.days || 1} day(s)`);
    
    // Calculate if today is within the allowed days (using IST)
    const createdAtUTC = new Date(reminder.createdAt);
    const createdAtIST = new Date(createdAtUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const createdDate = new Date(createdAtIST.getFullYear(), createdAtIST.getMonth(), createdAtIST.getDate());
    const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Created: ${createdDate.toDateString()}`);
    console.log(`📅 Today: ${today.toDateString()}`);
    console.log(`📅 Day ${diffDays + 1} of ${reminder.days || 1} day(s)`);
    
    // Check if reminder is still active (within the days range)
    // Day 0 = first day, Day 1 = second day, etc.
    const isActiveDay = diffDays >= 0 && diffDays < (reminder.days || 1);
    
    if (isActiveDay) {
      console.log(`✅ Reminder is active today`);
      
      // Parse reminder time
      const [h, m] = reminder.time.split(":");
      const reminderHour = Number(h);
      const reminderMinute = Number(m);
      
      console.log(`🎯 Target time: ${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')}`);
      console.log(`🕐 Current time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      // EXACT TIME MATCH - No tolerance window for precision
      const isExactTime = (reminderHour === currentHour && reminderMinute === currentMinute);
      
      if (isExactTime) {
        console.log(`🎯 EXACT TIME MATCH! Sending notification NOW...`);
        dueCount++;
        
        try {
          // ✅ NEW APPROACH: Pass User ID to sendPushNotification
          // The function will automatically find all FCM tokens and send to all devices
          const result = await sendPushNotification(
            reminder.user,  // MongoDB User ID (ObjectId) - not FCM token
            '💊 Medicine Reminder',
            `Time to take your ${reminder.medicine}!`,
            {
              medicine: reminder.medicine,
              time: reminder.time,
              reminderId: reminder._id.toString(),
              timestamp: nowIST.toISOString(),
              type: 'medicine_reminder'
            }
          );
          
          console.log('📊 Notification result:', result);
          
          if (result.success) {
            sentCount += result.validTokens || 1;
            console.log(`✅ Notification sent successfully to ${result.validTokens} device(s)`);
          } else {
            console.log(`❌ Failed to send notification: ${result.message}`);
          }
          
        } catch (error) {
          console.error(`❌ Error processing reminder:`, error.message);
        }
      } else {
        console.log(`⏳ Not the exact time yet (waiting for ${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')})`);
      }
    } else {
      console.log(`📅 Reminder expired (day ${diffDays + 1} > ${reminder.days || 1} days)`);
    }
  }
  
  console.log(`\n📊 SUMMARY: ${dueCount} reminders due, ${sentCount} notifications sent`);
  return { dueCount, sentCount };
}

module.exports = { checkAndSendReminders };