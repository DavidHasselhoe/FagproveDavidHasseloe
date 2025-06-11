const token = localStorage.getItem("token");

// DOM elements
const authNav = document.getElementById("authNav");
const welcomeButtons = document.getElementById("welcomeButtons");
const mainContent = document.getElementById("mainContent");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateNavAndWelcome();
});

// Update navigation and welcome section based on login status
function updateNavAndWelcome() {
  if (token) {
    showLoggedInState();
  } else {
    showLoggedOutState();
  }
}

// Show content for logged in users
function showLoggedInState() {
  // Show profile dropdown
  authNav.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Profil</a>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="/tours">Mine turer</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" onclick="logout()">Logg ut</button></li>
      </ul>
    </li>
  `;

  // Show main navigation cards
  mainContent.style.display = "block";
}

// Show content for logged out users
function showLoggedOutState() {
  // Show login/register links
  authNav.innerHTML = `
    <li class="nav-item"><a class="nav-link" href="/register">Registrer</a></li>
    <li class="nav-item"><a class="nav-link" href="/login">Logg inn</a></li>
  `;

  // Show welcome/registration buttons
  welcomeButtons.innerHTML = `
    <a href="/register" class="btn btn-light btn-lg">📝 Registrer deg</a>
    <a href="/login" class="btn btn-outline-light btn-lg">🔐 Logg inn</a>
  `;

  // Hide main content for non-logged in users
  mainContent.style.display = "none";
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

// Make logout function globally available
window.logout = logout;
