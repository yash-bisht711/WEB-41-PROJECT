// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore  } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDL89aUOhnEWyygSBL7BNn8A111rfxtHZU",
  authDomain: "e-commerce-platform-8404f.firebaseapp.com",
  projectId: "e-commerce-platform-8404f",
  storageBucket: "e-commerce-platform-8404f.firebasestorage.app",
  messagingSenderId: "98329134105",
  appId: "1:98329134105:web:e367fffef6c17374de9688",
  measurementId: "G-8S4CXW0078"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)