const admin = require('firebase-admin');
const path = require('path');

// Dynamically resolve the service account path for local and production
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'firebase-service-account.json');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
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