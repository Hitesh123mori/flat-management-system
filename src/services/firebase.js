// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCjAytJ2n0wlxrPcx5hrLQlP8Y1CN6B27k",
  authDomain: "arms-b06fd.firebaseapp.com",
  projectId: "arms-b06fd",
  storageBucket: "arms-b06fd.firebasestorage.app",
  messagingSenderId: "93721468926",
  appId: "1:93721468926:web:32b299aa91ef85dd216aaf",
  measurementId: "G-FV15CLT2EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


export default app;