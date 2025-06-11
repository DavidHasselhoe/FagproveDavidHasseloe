const token = localStorage.getItem("token");
let isAdmin = false;

//---DOM Elements---//
const competitionInfo = document.getElementById("competitionInfo");
const winnerDisplay = document.getElementById("winnerDisplay");
const drawSection = document.getElementById("drawSection");
const drawButton = document.getElementById("drawButton");
const participantsTable = document.querySelector("#participantsTable tbody");
const totalTicketsSpan = document.getElementById("totalTickets");
const totalParticipantsSpan = document.getElementById("totalParticipants");
const lotteryHistory = document.getElementById("lotteryHistory");
const message = document.getElementById("message");

//---Utility Functions---//
const showMessage = (text, type = "info") => {
  message.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
};

//---Load Lottery Data---//
async function loadLotteryData() {
  try {
    const res = await fetch("/api/lottery/");

    if (!res.ok) {
      if (res.status === 404) {
        showMessage("Ingen aktiv konkurranse funnet.", "info");
        hideAllSections();
        return;
      }
      throw new Error("Failed to load lottery data");
    }

    const data = await res.json();

    displayCompetitionInfo(data.competition, data.isArchived);
    displayParticipants(data.participants);
    updateStatistics(data.totalTickets, data.participants.length);

    if (data.isDrawn && data.winner) {
      displayWinner(data.winner);
      hideDrawSection();
      if (data.isArchived) {
        showMessage("Trekning utført! Konkurranse er arkivert.", "success");
      }
    } else {
      hideWinner();
      if (isAdmin && data.participants.length > 0) {
        showDrawSection();
      }
    }

    await loadLotteryHistory();
  } catch (err) {
    console.error("Error loading lottery data:", err);
    showMessage("Feil ved lasting av trekning data.", "danger");
  }
}

//---Display Functions---//
const displayCompetitionInfo = (competition, isArchived = false) => {
  if (!competitionInfo) return;

  const archiveStatus = isArchived
    ? '<span class="badge bg-secondary ms-2">Arkivert</span>'
    : "";
  competitionInfo.innerHTML = `
    <h3>${competition.name}${archiveStatus}</h3>
    <p class="mb-0">🏆 Premie: ${competition.prize || "Ikke spesifisert"}</p>
  `;
};

const displayParticipants = (participants) => {
  if (!participantsTable) return;

  if (participants.length === 0) {
    participantsTable.innerHTML =
      '<tr><td colspan="4" class="text-center">Ingen deltakere funnet</td></tr>';
    return;
  }

  participantsTable.innerHTML = participants
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.first_name} ${p.last_name}</td>
      <td>${p.tickets}</td>
      <td>${p.chance}%</td>
    </tr>
  `
    )
    .join("");
};

const updateStatistics = (totalTickets, totalParticipants) => {
  if (totalTicketsSpan) totalTicketsSpan.textContent = totalTickets;
  if (totalParticipantsSpan)
    totalParticipantsSpan.textContent = totalParticipants;
};

const displayWinner = (winner) => {
  if (!winnerDisplay) return;

  winnerDisplay.innerHTML = `
    <h4>🎉 Vinner: ${winner.name}</h4>
    <p class="mb-0">🎟️ Antall billetter: ${winner.tickets || "N/A"}</p>
    <p class="mb-0"><small>Trukket: ${formatDateTime(
      winner.drawnAt
    )}</small></p>
  `;
  winnerDisplay.classList.remove("d-none");
};

//---Toggle functions---//
const hideWinner = () => winnerDisplay?.classList.add("d-none");
const hideDrawSection = () => drawSection?.classList.add("d-none");
const showDrawSection = () => drawSection?.classList.remove("d-none");

const hideAllSections = () => {
  if (competitionInfo) competitionInfo.innerHTML = "";
  if (participantsTable) participantsTable.innerHTML = "";
  updateStatistics(0, 0);
  hideWinner();
  hideDrawSection();
};

//---Lottery History---//
async function loadLotteryHistory() {
  try {
    const history = await fetchJSON("/api/lottery/history");
    displayLotteryHistory(history);
  } catch (err) {
    console.error("Error loading lottery history:", err);
  }
}

const displayLotteryHistory = (history) => {
  if (!lotteryHistory) return;

  if (history.length === 0) {
    lotteryHistory.innerHTML =
      '<p class="text-center">Ingen trekninger funnet.</p>';
    return;
  }

  const table = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>#</th>
          <th>Konkurranse</th>
          <th>Vinner</th>
          <th>Premie</th>
          <th>Trekningstidspunkt</th>
        </tr>
      </thead>
      <tbody>
        ${history
          .map(
            (entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.winner}</td>
            <td>${entry.prize || "Ikke spesifisert"}</td>
            <td>${formatDateTime(entry.drawnAt)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  lotteryHistory.innerHTML = table;
};

//---Perform Draw---//
const performDraw = async () => {
  if (!confirm("Er du sikker på at du vil trekke en vinner?")) return;

  try {
    showMessage("Trekker vinner...", "info");

    const res = await fetch("/api/lottery/draw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to draw winner");
    }

    const data = await res.json();
    showMessage(
      `🎉 Vinneren er ${data.winner.name}! ${data.message}`,
      "success"
    );
    setTimeout(loadLotteryData, 1000);
  } catch (err) {
    console.error("Error drawing winner:", err);
    showMessage(`Feil ved trekking av vinner: ${err.message}`, "danger");
  }
};

//---Event Listeners---//
drawButton?.addEventListener("click", performDraw);

//---Initialize---//
const init = async () => {
  updateAuthNav(); // From common.js - safe navigation update

  isAdmin = await checkAdminStatus(); // From common.js

  if (isAdmin) {
    showMessage("Du er logget inn som admin.", "info");
  } else {
    showMessage(
      "Du er ikke admin. Noen funksjoner kan være utilgjengelige.",
      "warning"
    );
  }

  await loadLotteryData();
};

document.addEventListener("DOMContentLoaded", init);
