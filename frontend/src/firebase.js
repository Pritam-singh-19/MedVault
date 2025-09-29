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

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };