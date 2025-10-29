import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCJKqcQK1ibn0z8I9azrbzi-U2csiU0xaY",
  authDomain: "projectora-app.firebaseapp.com",
  projectId: "projectora-app",
  storageBucket: "projectora-app.firebasestorage.app",
  messagingSenderId: "744544370523",
  appId: "1:744544370523:web:98ec1b6fcf39c6b198247e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);