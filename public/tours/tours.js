const token = localStorage.getItem("token");

// DOM elements
const tableBody = document.getElementById("toursTableBody");
const addBtn = document.getElementById("addTourBtn");
const form = document.getElementById("tourForm");
const messageDiv = document.getElementById("message");

let modal;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  modal = new bootstrap.Modal(document.getElementById("tourModal"));
  updateAuthNav();
  loadTours();
  loadCompetitions();

  addBtn.onclick = () => openModal();
  form.onsubmit = saveTour;
});

// Load tours
async function loadTours() {
  if (!token) return (location.href = "/login");

  try {
    const tours = await fetchJSON("/api/tours", {
      headers: { Authorization: `Bearer ${token}` },
    });
    showTours(tours);
  } catch (err) {
    showMessage(err.message, "error");
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Feil ved lasting</td></tr>`;
  }
}

// Show tours in table
function showTours(tours) {
  if (!tours.length) {
    tableBody.innerHTML = `
      <tr><td colspan="5" class="text-center py-4">
        <p>Ingen turer registrert</p>
        <small class="text-muted">Klikk "Legg til ny tur" for å starte</small>
      </td></tr>
    `;
    return;
  }

  tableBody.innerHTML = tours
    .map(
      (tour) => `
    <tr>
      <td>${new Date(tour.date).toLocaleDateString("no")}</td>
      <td><strong>${tour.location}</strong></td>
      <td>${tour.description || "-"}</td>
      <td>${
        tour.competition_name
          ? `<span class="badge bg-primary">${tour.competition_name}</span>`
          : "-"
      }</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editTour(${
          tour.id
        })">Rediger</button>
        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteTour(${
          tour.id
        })">Slett</button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Load competitions for dropdown
async function loadCompetitions() {
  try {
    const res = await fetch("/api/competitions");
    if (!res.ok) return;

    const competitions = await res.json();
    const select = document.getElementById("competition_id");

    select.innerHTML = `
      <option value="">Ingen konkurranse</option>
      ${competitions
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("")}
    `;
  } catch (err) {
    console.log("Could not load competitions");
  }
}

// Open modal
function openModal(tour = null) {
  if (tour) {
    document.getElementById("tourModalLabel").textContent = "Rediger tur";
    document.getElementById("tourId").value = tour.id;
    document.getElementById("date").value = tour.date;
    document.getElementById("location").value = tour.location;
    document.getElementById("description").value = tour.description || "";
    document.getElementById("competition_id").value = tour.competition_id || "";
  } else {
    document.getElementById("tourModalLabel").textContent = "Ny tur";
    form.reset();
  }
  modal.show();
}

// Save tour
async function saveTour(e) {
  e.preventDefault();

  const data = new FormData(form);
  const tour = Object.fromEntries(data);

  if (!tour.description) tour.description = null;
  if (!tour.competition_id) tour.competition_id = null;

  const isEdit = !!tour.id;

  try {
    const res = await fetch(isEdit ? `/api/tours/${tour.id}` : "/api/tours", {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tour),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Kunne ikke lagre");
    }

    showMessage(isEdit ? "Tur oppdatert!" : "Tur lagret!", "success");
    modal.hide();
    loadTours();
  } catch (err) {
    showMessage(err.message, "error");
  }
}

// Edit tour
async function editTour(id) {
  try {
    const res = await fetch(`/api/tours/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Kunne ikke hente tur");

    const tour = await res.json();
    openModal(tour);
  } catch (err) {
    showMessage(err.message, "error");
  }
}

// Delete tour
async function deleteTour(id) {
  if (!confirm("Slett denne turen?")) return;

  try {
    const res = await fetch(`/api/tours/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Kunne ikke slette");

    showMessage("Tur slettet!", "success");
    loadTours();
  } catch (err) {
    showMessage(err.message, "error");
  }
}

// Show message
function showMessage(msg, type) {
  const alertType = type === "error" ? "alert-danger" : "alert-success";
  messageDiv.innerHTML = `
    <div class="alert ${alertType} alert-dismissible fade show">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => (messageDiv.innerHTML = ""), 4000);
}
