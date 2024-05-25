// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-b3b8d.firebaseapp.com",
  projectId: "mern-estate-b3b8d",
  storageBucket: "mern-estate-b3b8d.appspot.com",
  messagingSenderId: "407168497112",
  appId: "1:407168497112:web:c3f73db671c27788feeead"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);