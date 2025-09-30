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
 * @param {string} fcmToken - The device's FCM token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 */
async function sendPushNotification(fcmToken, title, body) {
  const message = {
    notification: {
      title,
      body,
      icon: 'https://your-frontend-domain/Medvault-logo.png' // Replace with your actual logo URL
    },
    token: fcmToken,
  };
  try {
    await admin.messaging().send(message);
    console.log('Push notification sent:', title, body);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = { sendPushNotification };