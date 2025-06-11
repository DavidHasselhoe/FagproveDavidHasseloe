const competitionsList = document.getElementById("competitionsList");
const message = document.getElementById("message");
const token = localStorage.getItem("token");
const competitionModal = document.getElementById("competitionModal");
const competitionForm = document.getElementById("competitionForm");
const competitionIdInput = document.getElementById("competitionId");
const addBtn = document.getElementById("addCompetitionBtn");

let isAdmin = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateAuthNav(); // Fra common.js
  loadCompetitions();
});

//---Load and show competitions---//
async function loadCompetitions() {
  try {
    // Check admin status
    if (token) {
      isAdmin = await checkAdminStatus(); // Fra common.js
      if (addBtn) addBtn.style.display = isAdmin ? "block" : "none";
    } else {
      if (addBtn) addBtn.style.display = "none";
    }

    // Get competitions
    const competitions = await fetchJSON("/api/competitions/"); // Fra common.js

    // Admin button logic
    if (isAdmin && addBtn) {
      const hasActiveCompetition = competitions.length > 0;
      addBtn.disabled = hasActiveCompetition;
      addBtn.textContent = hasActiveCompetition
        ? "Aktiv konkurranse eksisterer"
        : "Legg til konkurranse";
      addBtn.classList.toggle("disabled", hasActiveCompetition);
    }

    // Render competitions
    competitionsList.innerHTML = competitions.length
      ? competitions.map((c) => renderCompetition(c, isAdmin)).join("")
      : "<li class='list-group-item'>Ingen aktive konkurranser funnet.</li>";
  } catch (err) {
    message.innerText = "En feil oppstod under lasting av konkurranser.";
    console.error(err);
  }
}

//---Render competition//
function renderCompetition(competition, isAdmin = false) {
  const adminButtons = isAdmin
    ? `
    <button class="btn btn-sm btn-outline-primary edit-btn me-2" 
            data-id="${competition.id}"
            data-name="${competition.name}"
            data-description="${competition.description}"
            data-start_date="${competition.start_date}"
            data-end_date="${competition.end_date}"
            data-prize="${competition.prize}">
      Rediger
    </button>
    <button class="btn btn-sm btn-outline-danger delete-btn" 
            data-id="${competition.id}">
      Slett
    </button>
  `
    : "";

  return `
    <li class="list-group-item d-flex justify-content-between align-items-start">
      <div class="ms-2 me-auto">
        <div class="fw-bold">${competition.name}</div>
        ${competition.description}
        <br><small class="text-muted">
          ${formatDate(competition.start_date)} - ${formatDate(
    competition.end_date
  )}
        </small>
        ${
          competition.prize
            ? `<br><small class="text-success">🏆 ${competition.prize}</small>`
            : ""
        }
      </div>
      <div class="btn-group" role="group">
        ${adminButtons}
      </div>
    </li>
  `;
}

//---Modal handlers---//
function openAddModal() {
  competitionForm.reset();
  competitionIdInput.value = "";
  document.getElementById("competitionModalLabel").innerText =
    "Legg til konkurranse";
  new bootstrap.Modal(competitionModal).show();
}

function openEditModal(data) {
  competitionIdInput.value = data.id;
  document.getElementById("name").value = data.name;
  document.getElementById("description").value = data.description;
  document.getElementById("start_date").value = data.start_date;
  document.getElementById("end_date").value = data.end_date;
  document.getElementById("prize").value = data.prize;
  document.getElementById("competitionModalLabel").innerText =
    "Rediger konkurranse";
  new bootstrap.Modal(competitionModal).show();
}

//---Event listeners---//
if (addBtn) {
  addBtn.onclick = openAddModal;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    openEditModal(e.target.dataset);
  }

  if (e.target.classList.contains("delete-btn")) {
    handleDelete(e.target.dataset.id);
  }
});

//---Delete handler---//
async function handleDelete(id) {
  if (!confirm("Er du sikker på at du vil slette denne konkurransen?")) return;

  try {
    const res = await fetch(`/api/competitions/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      loadCompetitions();
    } else {
      const error = await res.json();
      alert(error.error || "Kunne ikke slette konkurranse");
    }
  } catch (err) {
    alert("En feil oppstod under sletting av konkurransen.");
    console.error(err);
  }
}

//---Form submit handler---//
if (competitionForm) {
  competitionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = competitionIdInput.value;
    const data = Object.fromEntries(new FormData(competitionForm));
    const url = id ? `/api/competitions/${id}` : "/api/competitions";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(competitionModal).hide();
        loadCompetitions();
      } else {
        const error = await res.json();
        alert(error.error || "Kunne ikke lagre konkurranse");
      }
    } catch (err) {
      alert("En feil oppstod under lagring av konkurransen.");
      console.error(err);
    }
  });
}
