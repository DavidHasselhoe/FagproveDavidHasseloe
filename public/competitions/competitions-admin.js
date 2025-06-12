const token = localStorage.getItem("token");
const competitionsList = document.getElementById("competitionsList");
const addBtn = document.getElementById("addCompetitionBtn");
const form = document.getElementById("competitionForm");

let isAdmin = false;

//---Initialize---//
document.addEventListener("DOMContentLoaded", async () => {
  updateAuthNav();
  isAdmin = await checkAdminStatus();
  await loadCompetitions();

  addBtn?.addEventListener("click", () =>
    handleModal("competitionModal", "Legg til konkurranse")
  );
  form?.addEventListener("submit", saveCompetition);
  competitionsList?.addEventListener("click", handleCompetitionActions);
});

//---Load Competitions---//
async function loadCompetitions() {
  try {
    const competitions = await fetchJSON("/api/competitions/");

    if (addBtn && isAdmin) {
      addBtn.style.display = "block";
      const hasActive = competitions.length > 0;
      addBtn.disabled = hasActive;
      addBtn.textContent = hasActive
        ? "Aktiv konkurranse eksisterer"
        : "Legg til konkurranse";
    }

    competitionsList.innerHTML = competitions.length
      ? competitions.map((c) => renderCompetition(c, isAdmin)).join("")
      : "<li class='list-group-item'>Ingen aktive konkurranser funnet.</li>";
  } catch (err) {
    handleApiError(err, "Kunne ikke laste konkurranser");
  }
}

//---Save Competition---//
async function saveCompetition(e) {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');

  const formData = new FormData(form);
  const competitionData = Object.fromEntries(formData);
  if (!competitionData.id) delete competitionData.id;

  const isEdit = !!competitionData.id;

  await apiCall(
    isEdit ? `/api/competitions/${competitionData.id}` : "/api/competitions",
    {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(competitionData),
    },
    submitBtn,
    isEdit ? "Konkurranse oppdatert!" : "Konkurranse opprettet!"
  );

  bootstrap.Modal.getInstance(
    document.getElementById("competitionModal")
  ).hide();
  await loadCompetitions();
}

//---Handle Actions---//
function handleCompetitionActions(e) {
  if (e.target.classList.contains("edit-btn")) {
    const btn = e.target;
    const competition = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      description: btn.dataset.description,
      start_date: btn.dataset.start_date,
      end_date: btn.dataset.end_date,
      prize: btn.dataset.prize,
    };
    handleModal("competitionModal", "Rediger konkurranse", competition);
  }
}

//---Event Listener for Delete Button---//
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const competitionId = e.target.dataset.id;

    // Use SweetAlert instead of confirm()
    showDeleteConfirmation("Slett konkurranse", null, () =>
      deleteCompetition(competitionId)
    );
  }
});

//---Delete Competition Function---//
async function deleteCompetition(id) {
  try {
    await apiCall(
      `/api/competitions/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
      null,
      "Konkurranse slettet!"
    );

    loadCompetitions();
  } catch (err) {
    console.error("Error deleting competition:", err);
  }
}

//---Render Competition---//
function renderCompetition(competition, isAdmin = false) {
  const adminButtons = isAdmin
    ? `
    <button class="btn btn-sm btn-outline-primary edit-btn me-2" 
            data-id="${competition.id}" data-name="${competition.name}"
            data-description="${competition.description || ""}" 
            data-start_date="${competition.start_date}"
            data-end_date="${competition.end_date}" 
            data-prize="${competition.prize || ""}">
      Rediger
    </button>
    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
      competition.id
    }">
      Slett
    </button>`
    : "";

  return `
    <li class="list-group-item d-flex justify-content-between align-items-start">
      <div class="ms-2 me-auto">
        <div class="fw-bold">${competition.name}</div>
        ${competition.description || ""}
        <br><small class="text-muted">${formatDate(
          competition.start_date
        )} - ${formatDate(competition.end_date)}</small>
        ${
          competition.prize
            ? `<br><small class="text-success">🏆 ${competition.prize}</small>`
            : ""
        }
      </div>
      <div class="btn-group">${adminButtons}</div>
    </li>`;
}
