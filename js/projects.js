import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("projects.js loaded");

window.onload = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Projects")); // <-- FIXED
    document.getElementById("projectCount").innerText = snapshot.size;
  } catch (err) {
    console.error("Firestore error:", err);
  }
};
