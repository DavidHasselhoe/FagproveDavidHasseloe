//---Utility Functions---//
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("no-NO");
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("no-NO");
}

//---Show Message Function---//
function showMessage(msg, type = "info") {
  let messageDiv = document.getElementById("message");

  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.id = "message";
    messageDiv.className =
      "position-fixed top-0 start-50 translate-middle-x mt-3";
    messageDiv.style.zIndex = "9999";
    document.body.appendChild(messageDiv);
  }

  const alertType =
    type === "error"
      ? "alert-danger"
      : type === "warning"
      ? "alert-warning"
      : type === "success"
      ? "alert-success"
      : "alert-info";

  messageDiv.innerHTML = `
    <div class="alert ${alertType} alert-dismissible fade show">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => {
    if (messageDiv && messageDiv.innerHTML) {
      messageDiv.innerHTML = "";
    }
  }, 4000);
}

//---Error Handling---//
function handleApiError(err, defaultMessage = "En feil oppstod") {
  if (err.message === "Sesjon utløpt") {
    return; 
  }

  const message = err.message.includes("HTTP error")
    ? defaultMessage
    : err.message;

  showMessage(message, "error");
}

//---Loading States---//
function setLoading(button, loading = true) {
  if (!button) return;

  if (loading) {
    button.disabled = true;
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }
    button.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Laster...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || "Lagre";
  }
}

//---Fetch With Token Validation---//
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  // Handle expired token
  if (response.status === 403 || response.status === 401) {
    const errorData = await response.json().catch(() => ({}));

    if (
      errorData.error?.includes("token") ||
      errorData.error?.includes("Unauthorized") ||
      (url.includes("/api/") && localStorage.getItem("token"))
    ) {
      showMessage(
        "Din sesjon har utløpt. Du blir sendt til innlogging.",
        "warning"
      );
      localStorage.removeItem("token");

      setTimeout(() => {
        window.location.href = "/login?expired=true";
      }, 2000);

      throw new Error("Sesjon utløpt");
    }
  }

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
    const user = await fetchJSON("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return user.is_admin;
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
}

//---Get Current User Info---//
async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const user = await fetchJSON("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return user;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

//---Navigation Functions---//
async function updateAuthNav() {
  const authNav = document.getElementById("authNav");
  if (!authNav) return;

  const token = localStorage.getItem("token");

  if (token) {
    const user = await getCurrentUser();
    const firstName = user ? user.first_name : "Bruker";

    authNav.innerHTML = `
      <li class="nav-item d-flex align-items-center me-3">
        <span class="navbar-text text-light d-flex align-items-center">
          <i class="fas fa-user me-2"></i>
          Hei, ${firstName}!
        </span>
      </li>
      <li class="nav-item dropdown d-flex align-items-center">
        <a class="nav-link dropdown-toggle d-flex align-items-center justify-content-center py-2 px-3" href="#" role="button" data-bs-toggle="dropdown" style="min-height: 40px;">
          <i class="fas fa-user-circle fa-2x"></i>
        </a>
        <ul class="dropdown-menu">
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

//---Logout Function---//
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

//---Check Token Validity---//
async function checkTokenValidity() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 403 || response.status === 401) {
      localStorage.removeItem("token");
      return false;
    }

    return response.ok;
  } catch (err) {
    localStorage.removeItem("token");
    return false;
  }
}

//---Auto-check Token On Page Load---//
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const currentPage = window.location.pathname;

  // Skip check for public pages
  const publicPages = ["/", "/login", "/register"];
  if (publicPages.includes(currentPage)) return;

  if (token) {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      showMessage(
        "Din sesjon har utløpt. Du blir sendt til innlogging.",
        "warning"
      );
      setTimeout(() => {
        window.location.href = "/login?expired=true";
      }, 2000);
    }
  }
});

//---Universal Modal Handler---//
function handleModal(modalId, titleText = "", formData = null) {
  const modalElement = document.getElementById(modalId);
  const modal = new bootstrap.Modal(modalElement);
  const titleElement = modalElement.querySelector(".modal-title");
  const form = modalElement.querySelector("form");

  if (titleElement) titleElement.textContent = titleText;

  if (formData && form) {
    // Populate form with data
    Object.entries(formData).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) field.value = value || "";
    });
  } else if (form) {
    form.reset();
  }

  modal.show();
  return modal;
}

//---Universal API Call with Loading---//
async function apiCall(
  url,
  options = {},
  loadingButton = null,
  successMessage = null
) {
  if (loadingButton) {
    setLoading(loadingButton, true);
  }

  try {
    const response = await fetchJSON(url, options);
    if (successMessage) {
      showMessage(successMessage, "success");
    }
    return response;
  } catch (err) {
    handleApiError(err);
    throw err;
  } finally {
    if (loadingButton) {
      setLoading(loadingButton, false);
    }
  }
}

//---Universal Table Renderer---//
function renderTable(
  tableBody,
  data,
  columns,
  noDataMessage = "Ingen data funnet"
) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="${columns.length}" class="text-center py-4">${noDataMessage}</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map((item, index) => {
      const cells = columns
        .map((col) => {
          if (typeof col === "function") {
            return col(item, index);
          } else if (typeof col === "object") {
            return col.render(item, index);
          } else {
            return `<td>${item[col] || "-"}</td>`;
          }
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");
}

//---SweetAlert Delete Confirmation---//
function showDeleteConfirmation(title, itemName, onConfirm) {
  Swal.fire({
    title: title,
    html: `Er du sikker på at du vil slette?
    <br><small class="text-muted">Denne handlingen kan ikke angres.</small>`,
    icon: "warning",
    iconColor: "#dc3545",
    showCancelButton: true,
    cancelButtonColor: "#6c757d",
    confirmButtonColor: "#dc3545",
    cancelButtonText: '<i class="fas fa-times me-2"></i>Avbryt',
    confirmButtonText: '<i class="fas fa-trash me-2"></i>Ja, slett!',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      confirmButton: "btn btn-danger px-4 me-2",
      cancelButton: "btn btn-outline-secondary px-4",
    },
    buttonsStyling: false,
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

//---Make ALL functions globally available---//
window.showMessage = showMessage;
window.handleModal = handleModal;
window.apiCall = apiCall;
window.renderTable = renderTable;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.handleApiError = handleApiError;
window.setLoading = setLoading;
window.fetchJSON = fetchJSON;
window.updateAuthNav = updateAuthNav;
window.getCurrentUser = getCurrentUser;
window.checkAdminStatus = checkAdminStatus;
window.logout = logout;
window.showDeleteConfirmation = showDeleteConfirmation;
