//---DOM Elements---//
const historyDropdown = document.getElementById("competitionHistoryDropdown");
const historyLeaderboard = document.getElementById("historyLeaderboard");
const historyError = document.getElementById("historyError");
const competitionDetails = document.getElementById("competitionDetails");

//---State---//
let cachedCompetitions = [];

//---Utility functions---//
const showError = (message) => {
  if (historyError) {
    historyError.textContent = message;
    historyError.classList.remove("d-none");
  }
};

const hideError = () => historyError?.classList.add("d-none");
const showLeaderboard = () => historyLeaderboard?.classList.remove("d-none");
const hideLeaderboard = () => historyLeaderboard?.classList.add("d-none");
const clearCompetitionDetails = () => {
  if (competitionDetails) competitionDetails.innerHTML = "";
};

//---Main functions---//
async function loadHistoryCompetitions() {
  try {
    cachedCompetitions = await fetchJSON("/api/competitions/history");

    if (!historyDropdown) return;

    const options = [
      '<option value="">Velg en konkurranse...</option>',
      ...cachedCompetitions.map(
        (comp) =>
          `<option value="${comp.id}">
          ${comp.name} (${formatDate(comp.start_date)} - ${formatDate(
            comp.end_date
          )})
         </option>`
      ),
    ];

    historyDropdown.innerHTML = options.join("");
    hideError();
  } catch (err) {
    console.error("Error loading history competitions:", err);
    showError("Kunne ikke laste konkurransehistorikk");
    cachedCompetitions = [];
  }
}

async function loadLeaderboardForCompetition(compId) {
  if (!compId) {
    hideLeaderboard();
    return;
  }

  try {
    const leaderboardData = await fetchJSON(
      `/api/leaderboard/?competition_id=${compId}`
    );
    const tbody = historyLeaderboard?.querySelector("tbody");

    if (!tbody) return;

    const rows = leaderboardData.map(
      (user, index) =>
        `<tr>
         <td>${index + 1}</td>
         <td>${user.first_name} ${user.last_name}</td>
         <td>${user.tour_count}</td>
       </tr>`
    );

    tbody.innerHTML = rows.join("");
    showLeaderboard();
    hideError();
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    showError("Kunne ikke laste resultattabell");
    hideLeaderboard();
  }
}

//---Show Competition Details---//
function showCompetitionDetails(compId) {
  if (!competitionDetails || !compId) {
    clearCompetitionDetails();
    return;
  }

  const competition = cachedCompetitions.find((c) => c.id == compId);
  if (!competition) {
    clearCompetitionDetails();
    return;
  }

  const details = [
    `<strong>${competition.name}</strong>`,
    `Periode: ${formatDate(competition.start_date)} – ${formatDate(
      competition.end_date
    )}`,
    `Premie: ${competition.prize || "Ingen premie spesifisert"}`,
    ...(competition.winner_user_id &&
    competition.first_name &&
    competition.last_name
      ? [`🏆 Vinner: ${competition.first_name} ${competition.last_name}`]
      : competition.winner_user_id
      ? [`🏆 Vinner: Bruker ${competition.winner_user_id}`]
      : []),
  ];

  competitionDetails.innerHTML = details.join("<br/>");
}

//---Event handlers---//
async function handleDropdownChange(event) {
  const compId = event.target.value;

  if (compId) {
    showCompetitionDetails(compId);
    await loadLeaderboardForCompetition(compId);
  } else {
    clearCompetitionDetails();
    hideLeaderboard();
    hideError();
  }
}

//---Initialize---//
document.addEventListener("DOMContentLoaded", async () => {
  await loadHistoryCompetitions();
  historyDropdown?.addEventListener("change", handleDropdownChange);
});
