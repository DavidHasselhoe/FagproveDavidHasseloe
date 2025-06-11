//---Utility Functions---//
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("no-NO");
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("no-NO");
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

//---Auth Functions---//
async function checkAdminStatus() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await fetch("/api/auth/profile", {
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      const user = await res.json();
      return user.is_admin;
    }
  } catch (err) {
    console.error("Error checking admin status:", err);
  }
  return false;
}

//---Navigation Functions---//
function updateAuthNav() {
  const authNav = document.getElementById("authNav");
  if (!authNav) return;

  const token = localStorage.getItem("token");

  if (token) {
    authNav.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          Profil
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="/tours">Mine turer</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()">Logg ut</a></li>
        </ul>
      </li>
    `;
  } else {
    authNav.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/login">Logg inn</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/register">Registrer</a>
      </li>
    `;
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

// Make logout globally available
window.logout = logout;
