const token = localStorage.getItem("token");
const toursList = document.getElementById("toursList");
const message = document.getElementById("message");
const tourModal = document.getElementById("tourModal");
const tourForm = document.getElementById("tourForm");
const tourIdInput = document.getElementById("tourId");

//---Load all tours for logged-in user---//
async function loadTours() {
  if (!token) {
    message.innerText = "You must be logged in to view your tours.";
    return;
  }
  try {
    const res = await fetch("/api/tours", {
      headers: { Authorization: "Bearer " + token },
    });
    const tours = res.ok ? await res.json() : [];
    toursList.innerHTML = tours.length
      ? tours
          .map(
            (t) =>
              `<li>
                <b>${t.date}:</b> ${t.location} - ${t.description || ""}
                <button class="edit-btn btn btn-sm btn-outline-primary"
                  data-id="${t.id}" data-date="${t.date}" data-location="${
                t.location
              }"
                  data-description="${t.description || ""}">
                  Edit
                </button>
                <button class="delete-btn btn btn-sm btn-outline-danger"
                  data-id="${t.id}">
                  Delete
                </button>
              </li>`
          )
          .join("")
      : "<li>No tours found.</li>";

    if (!res.ok) message.innerText = "Failed to fetch tours.";
  } catch (err) {
    message.innerText = "Error loading tours.";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadTours);

//---Add Tour---//
document.getElementById("addTourBtn").onclick = () => {
  tourForm.reset();
  tourIdInput.value = "";
  document.getElementById("tourModalLabel").innerText = "Add Tour";
  document.getElementById("competitionField").style.display = "block";
  const modal = new bootstrap.Modal(tourModal);
  modal.show();
};

//---Edit Tour---//
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    tourIdInput.value = e.target.dataset.id;
    document.getElementById("date").value = e.target.dataset.date;
    document.getElementById("location").value = e.target.dataset.location;
    document.getElementById("description").value = e.target.dataset.description;
    document.getElementById("tourModalLabel").innerText = "Edit Tour";
    document.getElementById("competitionField").style.display = "none";
    const modal = new bootstrap.Modal(tourModal);
    modal.show();
  }
});

//---Delete Tour---//
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this tour?")) {
      const id = e.target.dataset.id;
      try {
        const res = await fetch(`/api/tours/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          loadTours();
        } else {
          alert((await res.json()).error || "Could not delete tour");
        }
      } catch (err) {
        alert("An error occurred while deleting the tour.");
        console.error(err);
      }
    }
  }
});

//---Handle submitting add/edit tour form---//
tourForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = tourIdInput.value;
  const data = Object.fromEntries(new FormData(tourForm).entries());
  const url = id ? `/api/tours/${id}` : "/api/tours";
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
      bootstrap.Modal.getInstance(tourModal).hide();
      loadTours();
    } else {
      alert((await res.json()).error || "Could not save tour");
    }
  } catch (err) {
    alert("An error occurred while saving the tour.");
    console.error(err);
  }
});
