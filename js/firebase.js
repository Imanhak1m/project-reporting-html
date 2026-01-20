import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDehIoo1ViD1DV9zh1phJMSQOiAHFmbl9I",
  authDomain: "project-reporting-system-54a9b.firebaseapp.com",
  projectId: "project-reporting-system-54a9b",
  storageBucket: "project-reporting-system-54a9b.firebasestorage.app",
  messagingSenderId: "688470828500",
  appId: "1:688470828500:web:77b0d3431f1e5a1419a241"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
