import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorText = document.getElementById("loginError");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Clear previous errors
  errorText.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Show loading state
  btnText.style.display = "none";
  btnLoader.style.display = "inline-block";
  form.querySelector('button[type="submit"]').disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific Firebase errors
    let errorMessage = "Login failed";
    
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        errorMessage = "Invalid email or password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      default:
        errorMessage = error.message;
    }
    
    errorText.textContent = errorMessage;
    
    // Reset button state
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
    form.querySelector('button[type="submit"]').disabled = false;
  }
});
