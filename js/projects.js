import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", async () => {

  const projectCountEl = document.getElementById("projectCount");
  const projectListEl = document.getElementById("projectList");

  try {
    const querySnapshot = await getDocs(collection(db, "projects"));

    projectCountEl.innerText = querySnapshot.size;

    // Optional list display
    if (projectListEl) {
      projectListEl.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <h4>${data.title || "Untitled Project"}</h4>
          <p>Status: ${data.status || "N/A"}</p>
        `;
        projectListEl.appendChild(div);
      });
    }

  } catch (error) {
    console.error("Error loading projects:", error);
  }

});
