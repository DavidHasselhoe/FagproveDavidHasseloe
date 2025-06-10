async function loadLeaderboard() {
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    const data = await res.json();
    const tbody = document.querySelector("#leaderboardTable tbody");
    tbody.innerHTML = "";
    data.forEach((user, idx) => {
      const row = `<tr>
            <td>${idx + 1}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.tour_count}</td>
          </tr>`;
      tbody.innerHTML += row;
    });
  } catch (err) {
    document.getElementById("errorMessage").textContent = err.message;
    document.getElementById("errorMessage").classList.remove("d-none");
  }
}
document.addEventListener("DOMContentLoaded", loadLeaderboard);
