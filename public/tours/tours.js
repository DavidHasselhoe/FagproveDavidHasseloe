const token = localStorage.getItem("token");
const toursList = document.getElementById("toursList");
const message = document.getElementById("message");

//Har brukt lignende logikk i tidligere oppgave for å hente data fra API-et
async function loadTours() {
  if (!token)
    return (message.innerText = "You must be logged in to view your tours.");
  const res = await fetch("/api/me/tours", {
    headers: { Authorization: "Bearer " + token },
  });
  const tours = res.ok ? await res.json() : [];
  toursList.innerHTML = tours.length
    ? tours
        .map(
          (t) =>
            `<li><b>${t.date}:</b> ${t.location} - ${t.description || ""}</li>`
        )
        .join("")
    : "<li>No tours found.</li>";
  if (!res.ok) message.innerText = "Failed to fetch tours.";
}

document.addEventListener("DOMContentLoaded", loadTours);

const form = document.getElementById("addTourForm");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const res = await fetch("/api/tours", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById("addTourModal")).hide();
    loadTours();
  } else {
    alert((await res.json()).error || "Could not add tour");
  }
});
