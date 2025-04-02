import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCT6k4lSSII8bHcp6MT8qYf0_nBpWV2cQ",
  authDomain: "times-trophy.firebaseapp.com",
  projectId: "times-trophy",
  storageBucket: "times-trophy.appspot.com",
  messagingSenderId: "933029040647",
  appId: "1:933029040647:web:4cdf305f232fbe798190a2",
  measurementId: "G-9VR4Z0DGR6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
