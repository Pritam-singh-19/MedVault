// PWA Caching - ADD THIS AT THE TOP
const CACHE_NAME = 'medvault-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/in-app-logo.png',
  '/Medvault-logo.png',
  '/manifest.json'
];

// PWA Install Event
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// PWA Fetch Event (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// PWA Activate Event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FIREBASE MESSAGING - YOUR EXISTING CODE
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
    tag: 'medicine-reminder',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      ...payload.data,
      url: '/reminder',
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
  
  switch(event.action) {
    case 'taken':
      console.log('✅ Medicine marked as taken');
      break;
      
    case 'snooze':
      console.log('⏰ Reminder snoozed for 5 minutes');
      break;
      
    case 'view':
    default:
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes('/reminder') && 'focus' in client) {
              return client.focus();
            }
          }
          
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