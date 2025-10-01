const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Use JSON string from environment variable (for production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    // Use local file (for development)
    serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send a push notification to a device using FCM token.
 * @param {string|string[]} fcmTokenOrTokens - The device's FCM token or array of tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 */
async function sendPushNotification(fcmTokenOrTokens, title, body) {
  // Accepts a single token or an array of tokens
  const tokens = Array.isArray(fcmTokenOrTokens) ? fcmTokenOrTokens : [fcmTokenOrTokens];
  const message = {
    notification: {
      title,
      body,
      icon: 'https://your-frontend-domain/Medvault-logo.png' // Replace with your actual logo URL
    },
  };
  try {
    // Use sendEachForMulticast for multiple tokens
    if (tokens.length > 1) {
      const multicastMessage = { ...message, tokens };
      await admin.messaging().sendEachForMulticast(multicastMessage);
    } else {
      await admin.messaging().send({ ...message, token: tokens[0] });
    }
    console.log('Push notification sent:', title, body);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = { sendPushNotification };