import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const projectCount = document.getElementById("projectCount");

const loadProjects = async () => {
  const snapshot = await getDocs(collection(db, "projects"));
  projectCount.textContent = snapshot.size;
};

loadProjects();
