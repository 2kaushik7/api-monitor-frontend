// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBcACyY1dDsj03xEgPRt7Tv-XZKsyddk4",
  authDomain: "api-monitor-saas.firebaseapp.com",
  projectId: "api-monitor-saas",
  storageBucket: "api-monitor-saas.firebasestorage.app",
  messagingSenderId: "916287461316",
  appId: "1:916287461316:web:3014464123b0a0ebc5b691",
  measurementId: "G-1W61Z6ZVBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);