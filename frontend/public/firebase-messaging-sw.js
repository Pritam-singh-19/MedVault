importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeZ2ZQsoMKC_B_y-m8mYe5jiMNCnuRYwo",
  authDomain: "medvault-4d54b.firebaseapp.com",
  projectId: "medvault-4d54b",
  storageBucket: "medvault-4d54b.appspot.com",
  messagingSenderId: "599183176841",
  appId: "1:599183176841:web:6b8035e4feaad2685ac258",
  measurementId: "G-W39313KTGF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('🔔 Background notification received:', payload);
  
  const notificationTitle = payload.notification?.title || '💊 Medicine Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'Time to take your medicine!',
    icon: '/Medvault-logo.png',
    badge: '/Medvault-logo.png',
    tag: 'medicine-reminder', // Groups notifications
    requireInteraction: true, // Keeps notification visible until user interacts
    silent: false, // Play notification sound
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    timestamp: Date.now(),
    data: {
      ...payload.data,
      url: '/reminder', // URL to open when clicked
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'taken',
        title: '✅ Taken',
        icon: '/Medvault-logo.png'
      },
      {
        action: 'snooze',
        title: '⏰ Snooze 5min',
        icon: '/Medvault-logo.png'
      },
      {
        action: 'view',
        title: '👁️ View Reminders',
        icon: '/Medvault-logo.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();
  
  // Handle different actions
  switch(event.action) {
    case 'taken':
      // Mark medicine as taken (you can implement this later)
      console.log('✅ Medicine marked as taken');
      break;
      
    case 'snooze':
      // Snooze for 5 minutes (you can implement this later)
      console.log('⏰ Reminder snoozed for 5 minutes');
      break;
      
    case 'view':
    default:
      // Open the reminder page
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
          // Check if app is already open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes('/reminder') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If app is not open, open it
          if (clients.openWindow) {
            const baseUrl = event.notification.data?.url || '/reminder';
            return clients.openWindow(baseUrl);
          }
        })
      );
      break;
  }
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('🔕 Notification closed:', event.notification.tag);
});