// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaxwmvVsBAWwJ-gJi5KN3G7t72TD09VEE",
  authDomain: "eco-manage-b33ac.firebaseapp.com",
  projectId: "eco-manage-b33ac",
  storageBucket: "eco-manage-b33ac.firebasestorage.app",
  messagingSenderId: "566310203031",
  appId: "1:566310203031:web:018cefd9197c2cc67203d2",
  measurementId: "G-FT2C7QRHWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };
export default app;