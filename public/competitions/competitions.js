const competitionsList = document.getElementById("competitionsList");
const message = document.getElementById("message");
const token = localStorage.getItem("token");
const competitionModal = document.getElementById("competitionModal");
const competitionForm = document.getElementById("competitionForm");
const addBtn = document.getElementById("addCompetitionBtn");

// --- Helper: Fetch with auth header --- //
async function fetchAuth(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: "Bearer " + token,
    },
  });
}

// --- Check if user is admin --- //
async function isAdmin() {
  if (!token) return false;
  try {
    const res = await fetchAuth("/api/auth/profile");
    if (res.ok) {
      const user = await res.json();
      return !!user.is_admin;
    }
  } catch (err) {
    console.error("Error checking admin status:", err);
  }
  return false;
}

// --- Load all competitions and handle admin UI --- //
async function loadCompetitions() {
  if (!token) {
    message.innerText = "You must be logged in to view competitions.";
    return;
  }

  try {
    const admin = await isAdmin();
    addBtn.style.display = admin ? "block" : "none";

    const res = await fetchAuth("/api/competitions");
    if (!res.ok) {
      message.innerText = "Failed to fetch competitions.";
      return;
    }
    const competitions = await res.json();

    // If admin, disable button if there is a competition
    if (admin) {
      addBtn.disabled = competitions.length > 0;
      addBtn.textContent =
        competitions.length > 0
          ? "Competition Already Exists"
          : "Add Competition";
      addBtn.classList.toggle("disabled", competitions.length > 0);
    }

    competitionsList.innerHTML = competitions.length
      ? competitions
          .map(
            (c) => `
          <li class="list-group-item">
            <strong>${c.name}</strong><br/>
            <span>${c.description || ""}</span><br/>
            <small>From: ${c.start_date} to ${c.end_date}</small><br/>
            <span>Prize: ${c.prize || "—"}</span>
          </li>
        `
          )
          .join("")
      : "<li class='list-group-item'>No competitions found.</li>";
  } catch (err) {
    message.innerText = "An error occurred while loading competitions.";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadCompetitions);

// --- Open modal for adding a new competition --- //
addBtn.onclick = () => {
  competitionForm.reset();
  document.getElementById("competitionModalLabel").innerText =
    "Add Competition";
  new bootstrap.Modal(competitionModal).show();
};

// --- Handle submit for competition form --- //
competitionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(competitionForm).entries());
  try {
    const res = await fetchAuth("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      bootstrap.Modal.getInstance(competitionModal).hide();
      loadCompetitions();
    } else {
      alert((await res.json()).error || "Could not save competition");
    }
  } catch (err) {
    alert("An error occurred while saving the competition.");
    console.error(err);
  }
});
