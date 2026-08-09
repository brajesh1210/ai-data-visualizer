// frontend/src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhX9MxIsnjRdmjBeSlRHPVknf7WzsVGQk",
  authDomain: "aurabi-9f9e7.firebaseapp.com",
  projectId: "aurabi-9f9e7",
  storageBucket: "aurabi-9f9e7.firebasestorage.app",
  messagingSenderId: "604573127025",
  appId: "1:604573127025:web:5512c1a38866c91ac526d0",
  measurementId: "G-9Z6EX4QWF2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);