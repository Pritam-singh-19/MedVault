const admin = require('firebase-admin');
const path = require('path');
const User = require('./models/userModel');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Use JSON string from environment variable (for production)
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use individual environment variables
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
    } else {
      // Use local file (for development)
      serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
  }
}

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    console.log(`📤 Sending notification "${title}" to user ${userId}`);

    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`⚠️ No FCM tokens found for user ${userId}`);
      return { success: false, message: 'No FCM tokens found' };
    }

    const validTokens = [];
    const invalidTokens = [];
    
    console.log(`📱 Found ${user.fcmTokens.length} token(s) for user`);

    // Send to each token individually to identify invalid ones
    for (let i = 0; i < user.fcmTokens.length; i++) {
      const token = user.fcmTokens[i];
      console.log(`📱 Sending to device ${i + 1}: ${token.substring(0, 20)}...`);

      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
        },
        // Android specific options
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'medicine_reminders',
            icon: 'ic_notification',
          },
          priority: 'high',
        },
        // iOS specific options
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              alert: {
                title: title,
                body: body,
              },
            },
          },
          headers: {
            'apns-priority': '10',
          },
        },
        // Web push options
        webpush: {
          notification: {
            title: title,
            body: body,
            icon: 'https://medvault19.netlify.app/Medvault-logo.png',
            badge: 'https://medvault19.netlify.app/Medvault-logo.png',
            requireInteraction: true,
            actions: [
              {
                action: 'taken',
                title: '✅ Taken',
              },
              {
                action: 'snooze',
                title: '⏰ Snooze 5 min',
              }
            ],
          },
          headers: {
            'Urgency': 'high',
          },
        },
        token: token,
      };

      try {
        console.log(`📤 Sending notification "${title}" to 1 device(s)`);
        const response = await admin.messaging().send(message);
        console.log(`✅ Single notification sent successfully: ${response}`);
        console.log(`✅ Notification sent to device ${i + 1}: 1`);
        validTokens.push(token);
      } catch (error) {
        console.error(`❌ Error sending push notification:`, error.message);
        
        // Check if token is invalid/expired
        if (error.code === 'messaging/registration-token-not-registered' || 
            error.code === 'messaging/invalid-registration-token' ||
            error.message.includes('Requested entity was not found')) {
          console.log(`🗑️ Token is invalid/expired - should remove from database`);
          invalidTokens.push(token);
        }
        console.log(`✅ Notification sent to device ${i + 1}: Success`);
      }
    }

    // Clean up invalid tokens automatically
    if (invalidTokens.length > 0) {
      console.log(`🧹 Cleaning up ${invalidTokens.length} invalid token(s)`);
      for (const invalidToken of invalidTokens) {
        user.removeFCMToken(invalidToken);
      }
      await user.save();
      console.log(`✅ Cleaned up invalid tokens. Remaining: ${user.fcmTokens.length}`);
    }

    const totalSent = validTokens.length;
    return {
      success: totalSent > 0,
      message: `Notification sent to ${totalSent} device(s)`,
      validTokens: totalSent,
      invalidTokens: invalidTokens.length
    };

  } catch (error) {
    console.error('❌ Push notification error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendPushNotification };