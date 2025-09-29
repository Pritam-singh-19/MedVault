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
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/icon.png', // optional, use your own icon if you want
    }
  );
});