const admin = require('firebase-admin');
const path = require('path');

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

/**
 * Send a push notification to a device using FCM token.
 * @param {string|string[]} fcmTokenOrTokens - The device's FCM token or array of tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Additional data payload (optional).
 */
async function sendPushNotification(fcmTokenOrTokens, title, body, data = {}) {
  // Accepts a single token or an array of tokens
  const tokens = Array.isArray(fcmTokenOrTokens) ? fcmTokenOrTokens : [fcmTokenOrTokens];
  
  console.log(`📤 Sending notification "${title}" to ${tokens.length} device(s)`);
  
  const baseMessage = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
    // Android specific options
    android: {
      notification: {
        sound: 'default',
        priority: 'high',
        channelId: 'medicine_reminders',
        icon: 'ic_notification', // Use your app's notification icon
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
        icon: 'https://medvault19.netlify.app/Medvault-logo.png', // Updated with your domain
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
  };

  try {
    let results = [];
    let successCount = 0;
    let failureCount = 0;
    
    if (tokens.length > 1) {
      // Use sendEachForMulticast for multiple tokens
      const multicastMessage = { ...baseMessage, tokens };
      const response = await admin.messaging().sendEachForMulticast(multicastMessage);
      
      console.log(`✅ Multicast sent - Success: ${response.successCount}, Failure: ${response.failureCount}`);
      
      // Handle individual token failures
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Failed to send to token ${idx + 1}:`, resp.error?.message);
          if (resp.error?.code === 'messaging/registration-token-not-registered' || 
              resp.error?.code === 'messaging/invalid-registration-token') {
            console.log(`🗑️ Token ${idx + 1} is invalid and should be removed`);
          }
        }
      });
      
      successCount = response.successCount;
      failureCount = response.failureCount;
      results = response.responses;
      
    } else {
      // Single token send
      const singleMessage = { ...baseMessage, token: tokens[0] };
      const response = await admin.messaging().send(singleMessage);
      
      console.log('✅ Single notification sent successfully:', response);
      successCount = 1;
      results = [{ success: true, messageId: response }];
    }
    
    return { 
      success: true, 
      successCount, 
      failureCount, 
      results,
      message: `Sent ${successCount}/${tokens.length} notifications successfully`
    };
    
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log('🗑️ Token is invalid/expired - should remove from database');
    } else if (error.code === 'messaging/invalid-registration-token') {
      console.log('🗑️ Token format is invalid - should remove from database');
    } else if (error.code === 'messaging/authentication-error') {
      console.log('🔐 Firebase authentication error - check service account credentials');
    }
    
    return { 
      success: false, 
      error: error.message, 
      code: error.code,
      successCount: 0,
      failureCount: tokens.length 
    };
  }
}

module.exports = { sendPushNotification };