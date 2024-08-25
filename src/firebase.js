// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debugging log to ensure the file is being loaded correctly
console.log("Firebase configuration:", firebaseConfig);

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", app);

  const auth = getAuth(app);
  console.log("Firebase Auth initialized:", auth);

  const db = getFirestore(app);
  console.log("Firestore DB initialized:", db);

  const storage = getStorage(app);
  console.log("Firebase Storage initialized:", storage);

  export { auth, db, storage };
} catch (error) {
  console.error("Error initializing Firebase services:", error);
}