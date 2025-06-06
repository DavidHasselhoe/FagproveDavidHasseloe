const competitionsList = document.getElementById("competitionsList");
const message = document.getElementById("message");
const token = localStorage.getItem("token");
const competitionModal = document.getElementById("competitionModal");
const competitionForm = document.getElementById("competitionForm");
const competitionIdInput = document.getElementById("competitionId");
const addBtn = document.getElementById("addCompetitionBtn");

let isAdmin = false; // Store this globally

// --- Check if user is admin --- //
async function checkAdminStatus() {
  if (!token) return false;
  try {
    const res = await fetch("/api/auth/profile", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const user = await res.json();
      return user.is_admin;
    }
  } catch (err) {
    console.error("Error checking admin status:", err);
  }
  return false;
}

// --- Load all competitions and handle admin controls --- //
async function loadCompetitions() {
  if (!token) {
    message.innerText = "You must be logged in to view competitions.";
    addBtn.style.display = "none";
    return;
  }
  try {
    isAdmin = await checkAdminStatus();
    if (!isAdmin) addBtn.style.display = "none";
    else addBtn.style.display = "block";

    const res = await fetch("/api/competitions", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) {
      message.innerText = "Failed to fetch competitions.";
      return;
    }
    const competitions = await res.json();

    // Only allow one competition at a time
    if (isAdmin) {
      if (competitions.length > 0) {
        addBtn.disabled = true;
        addBtn.textContent = "Competition Already Exists";
        addBtn.classList.add("disabled");
      } else {
        addBtn.disabled = false;
        addBtn.textContent = "Add Competition";
        addBtn.classList.remove("disabled");
      }
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
              ${
                isAdmin
                  ? `
                <br>
                <button class="btn btn-sm btn-outline-primary edit-btn"
                  data-id="${c.id}"
                  data-name="${c.name}"
                  data-description="${c.description || ""}"
                  data-start_date="${c.start_date}"
                  data-end_date="${c.end_date}"
                  data-prize="${c.prize || ""}">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                  c.id
                }">
                  Delete
                </button>
              `
                  : ""
              }
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

// --- Add Competition (open modal for admin) --- //
addBtn.onclick = () => {
  competitionForm.reset();
  competitionIdInput.value = "";
  document.getElementById("competitionModalLabel").innerText =
    "Add Competition";
  const modal = new bootstrap.Modal(competitionModal);
  modal.show();
};

// --- Edit Competition --- //
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    competitionIdInput.value = e.target.dataset.id;
    document.getElementById("name").value = e.target.dataset.name;
    document.getElementById("description").value = e.target.dataset.description;
    document.getElementById("start_date").value = e.target.dataset.start_date;
    document.getElementById("end_date").value = e.target.dataset.end_date;
    document.getElementById("prize").value = e.target.dataset.prize;
    document.getElementById("competitionModalLabel").innerText =
      "Edit Competition";
    const modal = new bootstrap.Modal(competitionModal);
    modal.show();
  }
});

// --- Delete Competition --- //
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this competition?")) {
      const id = e.target.dataset.id;
      try {
        const res = await fetch(`/api/competitions/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          loadCompetitions();
        } else {
          alert((await res.json()).error || "Could not delete competition");
        }
      } catch (err) {
        alert("An error occurred while deleting the competition.");
        console.error(err);
      }
    }
  }
});

// --- Handle submit for add/edit competition form --- //
competitionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = competitionIdInput.value;
  const data = Object.fromEntries(new FormData(competitionForm).entries());
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
      alert((await res.json()).error || "Could not save competition");
    }
  } catch (err) {
    alert("An error occurred while saving the competition.");
    console.error(err);
  }
});
