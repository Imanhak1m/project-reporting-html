import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("DOMContentLoaded", () => {

  // Protect dashboard
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      document.getElementById("welcomeText").innerText =
        "Welcome " + user.email;
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });

});
