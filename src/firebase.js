// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQgp-5paXLfntSRuWnPNLq2arWEZTxwPU",
  authDomain: "voucher-bf9ef.firebaseapp.com",
  projectId: "voucher-bf9ef",
  storageBucket: "voucher-bf9ef.appspot.com",
  messagingSenderId: "814142702634",
  appId: "1:814142702634:web:94b9c13a01125d2abc6f53",
  measurementId: "G-SSYCK730XH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };