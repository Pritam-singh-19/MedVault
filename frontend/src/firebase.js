import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBeZ2ZQsoMKC_B_y-m8mYe5jiMNCnuRYwo",
  authDomain: "medvault-4d54b.firebaseapp.com",
  projectId: "medvault-4d54b",
  storageBucket: "medvault-4d54b.appspot.com",
  messagingSenderId: "599183176841",
  appId: "1:599183176841:web:6b8035e4feaad2685ac258",
  measurementId: "G-W39313KTGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('🔔 Foreground message received:', payload);
  
  // Show custom notification in foreground
  if (payload.notification) {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/Medvault-logo.png',
      badge: '/Medvault-logo.png',
      tag: 'medicine-reminder',
      requireInteraction: true
    });
  }
});

export { messaging, getToken };
export default app;