// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rumaestate-d54df.firebaseapp.com",
  projectId: "rumaestate-d54df",
  storageBucket: "rumaestate-d54df.appspot.com",
  messagingSenderId: "300163299229",
  appId: "1:300163299229:web:1b5b9d2c48448d7c836174",
  measurementId: "G-9Z5GCQ8X01"
};

// Initialize Firebase
//const analytics = getAnalytics(app);
export const app = initializeApp(firebaseConfig);
