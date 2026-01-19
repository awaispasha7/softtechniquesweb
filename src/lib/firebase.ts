import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZd-tu8zgQ5lEL4MyG5QZ3O9s3rMkRwMU",
  authDomain: "softtechniqueblog.firebaseapp.com",
  projectId: "softtechniqueblog",
  storageBucket: "softtechniqueblog.firebasestorage.app",
  messagingSenderId: "128265565487",
  appId: "1:128265565487:web:b6fe6ad7d67ad63b419dda",
  measurementId: "G-DHLBPVLCT1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

export default app;
