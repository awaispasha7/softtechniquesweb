import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBfeGok3BekmDKMApuqgFw3jOTZqlPZ4k",
  authDomain: "akeno-tech-blog.firebaseapp.com",
  projectId: "akeno-tech-blog",
  storageBucket: "akeno-tech-blog.firebasestorage.app",
  messagingSenderId: "971660241179",
  appId: "1:971660241179:web:d89bf456de20efd02bcbbe",
  measurementId: "G-04GNCJD3XZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
