import { auth, db } from "./firebase.js";
import { 
  createUserWithEmailAndPassword,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("signupForm");
const errorText = document.getElementById("signupError");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  errorText.textContent = "";
  
  // Get form values
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;
  
  // Validation
  if (password.length < 8) {
    errorText.textContent = "Password must be at least 8 characters long";
    return;
  }
  
  if (password !== confirmPassword) {
    errorText.textContent = "Passwords do not match";
    return;
  }
  
  if (!role) {
    errorText.textContent = "Please select a role";
    return;
  }
  
  // Show loading state
  btnText.style.display = "none";
  btnLoader.style.display = "inline-block";
  form.querySelector('button[type="submit"]').disabled = true;
  
  try {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Update user profile with name
    await updateProfile(user, {
      displayName: fullName
    });
    
    // 3. Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: fullName,
      role: role,
      createdAt: serverTimestamp()
    });
    
    // Success! Redirect to dashboard
    alert("Account created successfully! Redirecting to dashboard...");
    window.location.href = "dashboard.html";
    
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific Firebase errors
    let errorMessage = "Failed to create account";
    
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already registered. Please sign in instead.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak. Please use a stronger password.";
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
