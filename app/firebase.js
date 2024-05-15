// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyzAuvzpIMYfajagNTMwBKGX0aQ7t9RWQ",
  authDomain: "success-1af87.firebaseapp.com",
  databaseURL: "https://success-1af87-default-rtdb.firebaseio.com",
  projectId: "success-1af87",
  storageBucket: "success-1af87.appspot.com",
  messagingSenderId: "168356912",
  appId: "1:168356912:web:4bf0b2c341a0eb55e791f5",
  measurementId: "G-5053RS9GW7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);