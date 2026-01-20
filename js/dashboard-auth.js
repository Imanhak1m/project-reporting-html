console.log("dashboard-auth.js loaded");

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("dashboard-auth loaded");

window.onload = () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) {
    console.error("Logout button NOT FOUND");
    return;
  }

  logoutBtn.onclick = async () => {
    try {
      await signOut(auth);
      window.location.replace("index.html");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("index.html");
    } else {
      document.getElementById("welcomeText").innerText =
        "Welcome " + user.email;
    }
  });

};
