async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function renderCompetition(c, isAdmin = false) {
  return `
    <li class="list-group-item">
      <strong>${c.name}</strong><br/>
      <span>${c.description || ""}</span><br/>
      <small>From: ${c.start_date} to ${c.end_date}</small><br/>
      <span>Prize: ${c.prize || "—"}</span>
      ${isAdmin ? renderAdminButtons(c) : ""}
    </li>
  `;
}

function renderAdminButtons(c) {
  return `
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
    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${c.id}">
      Delete
    </button>
  `;
}

function formatDate(date) {
  if (!date) return "";
  return date.substring(0, 10);
}
