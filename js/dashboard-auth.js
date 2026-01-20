import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// ✅ Protect dashboard (redirect if not logged in)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // back to login
  } else {
    const welcome = document.getElementById("welcomeText");
    if (welcome) {
      welcome.innerText = "Welcome " + (user.email || "User");
    }
  }
});

// ✅ Logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html"; // login page
    });
  });
}
