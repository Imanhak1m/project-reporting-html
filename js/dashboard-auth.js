import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    welcomeText.textContent = "Welcome Admin";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

