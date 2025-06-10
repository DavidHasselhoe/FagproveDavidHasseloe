//---DOM Elements---//
const leaderboardTable = document.querySelector("#leaderboardTable tbody");
const errorMessage = document.getElementById("errorMessage");

//---Utility functions---//
function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("d-none");
  }
}

function hideError() {
  if (errorMessage) errorMessage.classList.add("d-none");
}

function clearTable() {
  if (leaderboardTable) leaderboardTable.innerHTML = "";
}

//---Fetch active competition ID---//
async function fetchActiveCompetitionId() {
  try {
    const res = await fetch("/api/competitions"); // Use existing endpoint that returns active competitions
    if (!res.ok) throw new Error("Failed to fetch active competition");
    const competitions = await res.json();
    return competitions.length > 0 ? competitions[0].id : null;
  } catch (err) {
    console.error("Error fetching active competition:", err);
    throw err;
  }
}

//---Load leaderboard data---//
async function loadLeaderboard(competitionId) {
  try {
    let url = "/api/leaderboard";
    if (competitionId) url += `?competition_id=${competitionId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");

    const data = await res.json();

    if (!leaderboardTable) return;

    //---Generate all rows at once for better performance---//
    const rows = data.map(
      (user, index) =>
        `<tr>
         <td>${index + 1}</td>
         <td>${user.first_name} ${user.last_name}</td>
         <td>${user.tour_count}</td>
       </tr>`
    );

    leaderboardTable.innerHTML = rows.join("");
    hideError();
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    showError(err.message);
    clearTable();
  }
}

//---Initialize leaderboard---//
async function initializeLeaderboard() {
  try {
    const activeId = await fetchActiveCompetitionId();

    if (activeId) {
      await loadLeaderboard(activeId);
    } else {
      showError("No active competition right now.");
      clearTable();
    }
  } catch (err) {
    console.error("Error initializing leaderboard:", err);
    showError("Failed to load leaderboard data.");
    clearTable();
  }
}

//---Event listeners---//
document.addEventListener("DOMContentLoaded", initializeLeaderboard);
