import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("projects.js loaded");

let editingProjectId = null;
let currentUserRole = null;

// Admin emails list
const adminEmails = ['admin@test.com', 'PLBpdtbd@admin.com'];

// Check if current user is admin
function isAdmin(user) {
  if (!user) return false;
  // Check by email
  if (adminEmails.includes(user.email)) return true;
  // Role will be checked when user data is loaded
  return currentUserRole === 'admin';
}

// Status mapping
const statusMap = {
  BM: "Belum Mula",
  SD: "Sedang Dilaksanakan",
  SL: "Selesai",
  TG: "Tertangguh"
};

// Load and display projects
async function loadProjects() {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
    
    let q;
    
    // Check if user is admin
    if (isAdmin(currentUser)) {
      // Admin sees ALL projects
      q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      console.log("Loading all projects (admin view)");
    } else {
      // Regular user sees only their own projects
      q = query(
        collection(db, "projects"), 
        where("createdBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      console.log("Loading user's projects only");
    }
    
    const snapshot = await getDocs(q);
    
    document.getElementById("projectCount").innerText = snapshot.size;
    
    const projectList = document.getElementById("projectList");
    projectList.innerHTML = "";
    
    if (snapshot.empty) {
      projectList.innerHTML = '<p class="no-projects">No projects yet. Click "Add New Project" to create one.</p>';
      return;
    }
    
    snapshot.forEach((docSnap) => {
      const project = docSnap.data();
      const projectCard = createProjectCard(docSnap.id, project);
      projectList.appendChild(projectCard);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
    alert("Failed to load projects: " + err.message);
  }
}

// Get progress color based on percentage
function getProgressColor(percent) {
  if (percent >= 75) return "#2e7d32"; // Green
  if (percent >= 50) return "#1976d2"; // Blue
  if (percent >= 25) return "#f57c00"; // Orange
  return "#c62828"; // Red
}

// Create project card HTML
function createProjectCard(id, project) {
  const card = document.createElement("div");
  card.className = "project-card";
  
  const statusClass = project.status ? project.status.toLowerCase() : "bm";
  const progress = project.progressPercent !== undefined ? project.progressPercent : 0;
  const progressColor = getProgressColor(progress);
  
  card.innerHTML = `
    <div class="project-header">
      <h3>${project.projectTitle || "Untitled Project"}</h3>
      <span class="status-badge status-${statusClass}">${statusMap[project.status] || project.status}</span>
    </div>
    
    <div class="progress-section">
      <div class="progress-label">
        <span>Progress</span>
        <span class="progress-value">${progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%; background-color: ${progressColor};"></div>
      </div>
    </div>
    
    <div class="project-details">
      <div class="detail-row">
        <strong>Contractor:</strong> ${project.contractor || "N/A"}
      </div>
      <div class="detail-row">
        <strong>Person In Charge:</strong> ${project.personInCharge || "N/A"}
      </div>
      <div class="detail-row">
        <strong>Allocation Source:</strong> ${project.allocationSource || "N/A"}
      </div>
      <div class="detail-row">
        <strong>Cost of Work:</strong> RM ${formatNumber(project.costOfWork)}
      </div>
      <div class="detail-row">
        <strong>Department Budget:</strong> RM ${formatNumber(project.departmentBudget)}
      </div>
      ${project.notes ? `<div class="detail-row"><strong>Notes:</strong> ${project.notes}</div>` : ""}
      ${project.driveFolderUrl ? `
        <div class="detail-row">
          <strong>Documents:</strong> 
          <a href="${project.driveFolderUrl}" target="_blank" class="drive-link">📁 Open Drive Folder</a>
        </div>
      ` : ""}
    </div>
    
    <div class="project-actions">
      <button class="btn-edit" onclick="editProject('${id}')">Edit</button>
      <button class="btn-delete" onclick="deleteProject('${id}', '${project.projectTitle}')">Delete</button>
    </div>
  `;
  
  return card;
}

// Format number with commas
function formatNumber(num) {
  if (!num && num !== 0) return "0.00";
  return Number(num).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Show/hide form
function showForm(isEdit = false) {
  const formContainer = document.getElementById("projectFormContainer");
  formContainer.style.display = "block";
  document.getElementById("formTitle").innerText = isEdit ? "Edit Project" : "Add New Project";
  if (!isEdit) {
    document.getElementById("projectForm").reset();
    document.getElementById("progressPercent").value = 0; // Default to 0%
    editingProjectId = null;
  }
  
  // Smooth scroll to form
  setTimeout(() => {
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideForm() {
  document.getElementById("projectFormContainer").style.display = "none";
  document.getElementById("projectForm").reset();
  editingProjectId = null;
}

// Edit project
window.editProject = async function(projectId) {
  try {
    const docRef = doc(db, "projects", projectId);
    const snapshot = await getDocs(collection(db, "projects"));
    
    let projectData = null;
    snapshot.forEach((docSnap) => {
      if (docSnap.id === projectId) {
        projectData = docSnap.data();
      }
    });
    
    if (!projectData) {
      alert("Project not found!");
      return;
    }
    
    // Fill form with existing data
    document.getElementById("projectTitle").value = projectData.projectTitle || "";
    document.getElementById("contractor").value = projectData.contractor || "";
    document.getElementById("personInCharge").value = projectData.personInCharge || "";
    document.getElementById("allocationSource").value = projectData.allocationSource || "";
    document.getElementById("costOfWork").value = projectData.costOfWork || "";
    document.getElementById("departmentBudget").value = projectData.departmentBudget || "";
    document.getElementById("status").value = projectData.status || "BM";
    document.getElementById("progressPercent").value = projectData.progressPercent !== undefined ? projectData.progressPercent : 0;
    document.getElementById("driveFolderUrl").value = projectData.driveFolderUrl || "";
    document.getElementById("notes").value = projectData.notes || "";
    
    editingProjectId = projectId;
    showForm(true);
  } catch (err) {
    console.error("Error loading project:", err);
    alert("Failed to load project: " + err.message);
  }
};

// Delete project
window.deleteProject = async function(projectId, projectTitle) {
  if (!confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
    return;
  }
  
  try {
    await deleteDoc(doc(db, "projects", projectId));
    alert("Project deleted successfully!");
    loadProjects();
  } catch (err) {
    console.error("Error deleting project:", err);
    alert("Failed to delete project: " + err.message);
  }
};

// Form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const progressValue = Number(document.getElementById("progressPercent").value);
  
  // Validate progress percentage
  if (progressValue < 0 || progressValue > 100) {
    alert("Progress must be between 0 and 100!");
    return;
  }
  
  const formData = {
    projectTitle: document.getElementById("projectTitle").value.trim(),
    contractor: document.getElementById("contractor").value.trim(),
    personInCharge: document.getElementById("personInCharge").value.trim(),
    allocationSource: document.getElementById("allocationSource").value.trim(),
    costOfWork: Number(document.getElementById("costOfWork").value),
    departmentBudget: Number(document.getElementById("departmentBudget").value),
    status: document.getElementById("status").value,
    progressPercent: progressValue,
    driveFolderUrl: document.getElementById("driveFolderUrl").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    updatedAt: serverTimestamp()
  };
  
  try {
    if (editingProjectId) {
      // Update existing project
      await updateDoc(doc(db, "projects", editingProjectId), formData);
      alert("Project updated successfully!");
    } else {
      // Create new project
      formData.createdAt = serverTimestamp();
      formData.createdBy = auth.currentUser ? auth.currentUser.uid : "unknown";
      await addDoc(collection(db, "projects"), formData);
      alert("Project created successfully!");
    }
    
    hideForm();
    loadProjects();
  } catch (err) {
    console.error("Error saving project:", err);
    alert("Failed to save project: " + err.message);
  }
}

// Initialize
window.addEventListener("load", async () => {
  // Load current user role from Firestore
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", currentUser.uid)));
      if (!userDoc.empty) {
        currentUserRole = userDoc.docs[0].data().role;
        console.log("User role:", currentUserRole);
      }
    } catch (err) {
      console.error("Error loading user role:", err);
    }
  }
  
  loadProjects();
  
  // Form buttons
  document.getElementById("addProjectBtn").addEventListener("click", () => showForm(false));
  document.getElementById("closeFormBtn").addEventListener("click", hideForm);
  document.getElementById("cancelFormBtn").addEventListener("click", hideForm);
  document.getElementById("projectForm").addEventListener("submit", handleFormSubmit);
});
