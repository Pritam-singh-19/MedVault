import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyXXXXX-XXXXX",
  authDomain: "medvault.firebaseapp.com",
  projectId: "medvault",
  storageBucket: "medvault.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXX"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };