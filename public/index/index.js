const token = localStorage.getItem("token");

// DOM elements
const authNav = document.getElementById("authNav");
const welcomeButtons = document.getElementById("welcomeButtons");

//---Initialize---//
document.addEventListener("DOMContentLoaded", async () => {
  await updateAuthNav();

  const welcomeButtons = document.getElementById("welcomeButtons");
  const token = localStorage.getItem("token");

  if (welcomeButtons && !token) {
    welcomeButtons.innerHTML = `
      <a href="/login" class="btn btn-outline-light btn-lg">Logg inn</a>
      <a href="/register" class="btn btn-outline-light btn-lg">Registrer deg</a>
    `;
  }
});

// Logout function
function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

// Make logout function globally available
window.logout = logout;
