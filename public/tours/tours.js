//---Simplified Tours.js Using Common Functions---//
const token = localStorage.getItem("token");
const tableBody = document.getElementById("toursTableBody");
const addBtn = document.getElementById("addTourBtn");
const form = document.getElementById("tourForm");

let modal;

//---Initialize---//
document.addEventListener("DOMContentLoaded", () => {
  updateAuthNav();
  loadTours();
  loadCompetitions();

  addBtn.onclick = () => handleModal("tourModal", "Ny tur");
  form.onsubmit = saveTour;
});

//---Load Tours---//
async function loadTours() {
  if (!token) return (location.href = "/login");

  try {
    const tours = await fetchJSON("/api/tours", {
      headers: { Authorization: `Bearer ${token}` },
    });

    renderTable(
      tableBody,
      tours,
      [
        (tour) => `<td>${formatDate(tour.date)}</td>`,
        (tour) => `<td><strong>${tour.location}</strong></td>`,
        (tour) => `<td>${tour.description || "-"}</td>`,
        (tour) =>
          `<td>${
            tour.competition_name
              ? `<span class="badge bg-primary">${tour.competition_name}</span>`
              : "-"
          }</td>`,
        (tour) => `<td>
        <button class="btn btn-sm btn-outline-primary" onclick="editTour(${tour.id})">Rediger</button>
        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteTour(${tour.id})">Slett</button>
      </td>`,
      ],
      "Ingen turer registrert"
    );
  } catch (err) {
    handleApiError(err, "Kunne ikke laste turer");
  }
}

//---Load Competitions---//
async function loadCompetitions() {
  try {
    const competitions = await fetchJSON("/api/competitions");
    const select = document.getElementById("competition_id");
    select.innerHTML =
      `<option value="">Ingen konkurranse</option>` +
      competitions
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("");
  } catch (err) {
    console.log("Could not load competitions");
  }
}

//---Save Tour---//
async function saveTour(e) {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');

  const formData = new FormData(form);
  const tour = Object.fromEntries(formData);

  if (!tour.description?.trim()) tour.description = null;
  if (!tour.competition_id) tour.competition_id = null;

  const isEdit = tour.id && tour.id.trim() !== "" && tour.id !== "null";

  // Remove ID from payload if not editing
  if (!isEdit) {
    delete tour.id;
  }

  await apiCall(
    isEdit ? `/api/tours/${tour.id}` : "/api/tours",
    {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tour),
    },
    submitBtn,
    isEdit ? "Tur oppdatert!" : "Tur lagret!"
  );

  bootstrap.Modal.getInstance(document.getElementById("tourModal")).hide();
  loadTours();
}

//---Edit Tour---//
async function editTour(id) {
  try {
    const tour = await fetchJSON(`/api/tours/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    handleModal("tourModal", "Rediger tur", tour);
  } catch (err) {
    handleApiError(err, "Kunne ikke hente tur");
  }
}

//---Delete Tour Function---//
async function deleteTour(id) {
  showDeleteConfirmation("Slett tur", null, async () => {
    try {
      await apiCall(
        `/api/tours/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
        null,
        "Tur slettet!"
      );

      loadTours();
    } catch (err) {
      console.error("Error deleting tour:", err);
    }
  });
}

window.editTour = editTour;
window.deleteTour = deleteTour;
