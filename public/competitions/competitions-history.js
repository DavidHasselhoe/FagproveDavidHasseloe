//---DOM Elements---//
const historyDropdown = document.getElementById("competitionHistoryDropdown");
const historyLeaderboard = document.getElementById("historyLeaderboard");
const historyError = document.getElementById("historyError");
const competitionDetails = document.getElementById("competitionDetails");

//---State management---//
let cachedCompetitions = [];

//---Utility functions---//
function showError(message) {
  if (historyError) {
    historyError.textContent = message;
    historyError.classList.remove("d-none");
  }
}

function hideError() {
  if (historyError) historyError.classList.add("d-none");
}

function showLeaderboard() {
  if (historyLeaderboard) historyLeaderboard.classList.remove("d-none");
}

function hideLeaderboard() {
  if (historyLeaderboard) historyLeaderboard.classList.add("d-none");
}

function clearCompetitionDetails() {
  if (competitionDetails) competitionDetails.innerHTML = "";
}

//---Main functions---//
async function loadHistoryCompetitions() {
  try {
    cachedCompetitions = await fetchJSON("/api/competitions/history");

    if (!historyDropdown) return;

    const options = [
      '<option value="">Choose a competition…</option>',
      ...cachedCompetitions.map(
        (competition) =>
          `<option value="${competition.id}">
          ${competition.name} (${formatDate(
            competition.start_date
          )} - ${formatDate(competition.end_date)})
         </option>`
      ),
    ];

    historyDropdown.innerHTML = options.join("");
    hideError();
  } catch (err) {
    console.error("Error loading history competitions:", err);
    showError("Failed to load competition history");
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

    if (!historyLeaderboard) return;

    const tbody = historyLeaderboard.querySelector("tbody");
    if (!tbody) return;

    //---Generate leaderboard rows---//
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
    showError("Failed to load leaderboard data");
    hideLeaderboard();
  }
}

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

  //---Build competition details HTML---//
  const details = [
    `<strong>${competition.name}</strong>`,
    `Period: ${formatDate(competition.start_date)} – ${formatDate(
      competition.end_date
    )}`,
    `Prize: ${competition.prize || "No prize specified"}`,
    ...(competition.winner_user_id
      ? [`Winner: ${competition.winner_user_id}`]
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

  if (historyDropdown) {
    historyDropdown.addEventListener("change", handleDropdownChange);
  }
});
