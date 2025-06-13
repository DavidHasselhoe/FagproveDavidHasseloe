const token = localStorage.getItem("token");
const competitionInfo = document.getElementById("competitionInfo");
const winnerDisplay = document.getElementById("winnerDisplay");
const drawSection = document.getElementById("drawSection");
const participantsTable = document.querySelector("#participantsTable tbody");
const lotteryHistory = document.getElementById("lotteryHistory");

let isAdmin = false;

//---Initialize---//
document.addEventListener("DOMContentLoaded", async () => {
  updateAuthNav();
  isAdmin = await checkAdminStatus();
  await loadLotteryData();

  document.getElementById("drawButton")?.addEventListener("click", performDraw);
});

//---Load Lottery Data---//
async function loadLotteryData() {
  try {
    const data = await fetchJSON("/api/lottery/");

    displayCompetitionInfo(data.competition, data.isArchived);

    renderTable(
      participantsTable,
      data.participants,
      [
        (p, i) => `<td>${i + 1}</td>`,
        (p) => `<td>${p.first_name} ${p.last_name}</td>`,
        "tickets",
        (p) => `<td>${p.chance}%</td>`,
      ],
      "Ingen deltakere funnet"
    );

    // FIX: Update the statistics display
    updateStatistics(data.totalTickets || 0, data.participants.length || 0);

    if (data.isDrawn && data.winner) {
      displayWinner(data.winner);
    } else if (isAdmin && data.participants.length > 0) {
      drawSection.classList.remove("d-none");
    }

    await loadLotteryHistory();
  } catch (err) {
    handleApiError(err, "Kunne ikke laste lotteri-data");
  }
}

//---Display Functions---//
const displayCompetitionInfo = (competition, isArchived) => {
  const archiveStatus = isArchived ? " (Arkivert)" : "";
  competitionInfo.innerHTML = `
    <h3>${competition.name}${archiveStatus}</h3>
    <p class="mb-0">🏆 Premie: ${competition.prize || "Ikke spesifisert"}</p>
  `;
};

const displayWinner = (winner) => {
  winnerDisplay.innerHTML = `
    <h4>🎉 Vinner: ${winner.name}</h4>
    <p>Trukket: ${formatDateTime(winner.drawnAt)}</p>
  `;
  winnerDisplay.classList.remove("d-none");
};

//---Perform Draw---//
async function performDraw() {
  const drawBtn = document.getElementById("drawButton");

  await apiCall(
    "/api/lottery/draw",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    drawBtn,
    "Trekning utført!"
  );

  await loadLotteryData();
}

//---Load History---//
async function loadLotteryHistory() {
  try {
    const history = await fetchJSON("/api/lottery/history");

    if (!history.length) {
      lotteryHistory.innerHTML =
        '<p class="text-center">Ingen trekninger funnet.</p>';
      return;
    }

    const table = `
      <table class="table table-striped table-hover">
        <thead>
          <tr><th>Konkurranse</th><th>Vinner</th><th>Premie</th><th>Trekningstidspunkt</th></tr>
        </thead>
        <tbody>
          ${history
            .map(
              (entry) => `
            <tr>
              <td><strong>${entry.name}</strong></td>
              <td><i class="fas fa-trophy text-warning me-2"></i>${
                entry.winner
              }</td>
              <td>${entry.prize || "Ikke spesifisert"}</td>
              <td>${formatDateTime(entry.drawnAt)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>`;
    lotteryHistory.innerHTML = table;
  } catch (err) {
    console.error("Error loading lottery history:", err);
  }
}

//---Add Statistics Update Function---//
function updateStatistics(totalTickets, totalParticipants) {
  const totalTicketsElement = document.getElementById("totalTickets");
  const totalParticipantsElement = document.getElementById("totalParticipants");

  if (totalTicketsElement) {
    totalTicketsElement.textContent = totalTickets;
  }

  if (totalParticipantsElement) {
    totalParticipantsElement.textContent = totalParticipants;
  }
}
