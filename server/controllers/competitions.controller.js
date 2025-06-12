/*
Har brukt denne logikken i en tidligere oppgave der jeg skulle lage en blog applikasjon,
der man kunne opprette, oppdatere og slette innlegg. Så jeg har tatt utgangspunkt i den koden.
*/

const db = require("../database");

//---Helper function for admin check---//
async function checkAdminAccess(userId, res) {
  const userResult = await db.query(
    "SELECT is_admin FROM users WHERE id = $1",
    [userId]
  );

  if (userResult.rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return false;
  }

  if (!userResult.rows[0].is_admin) {
    res
      .status(403)
      .json({ error: "Only administrators can perform this action" });
    return false;
  }

  return true;
}

//---Helper function for active competition check---//
async function checkActiveCompetition() {
  const today = new Date().toISOString().split("T")[0];
  const result = await db.query(
    "SELECT COUNT(*) as count FROM competitions WHERE start_date <= $1 AND end_date >= $1 AND is_archived = FALSE",
    [today]
  );
  return parseInt(result.rows[0].count);
}

//---Get only ACTIVE competitions (not archived)---//
exports.getCompetitions = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { rows } = await db.query(
      `
      SELECT * FROM competitions 
      WHERE start_date <= $1 AND end_date >= $1 AND is_archived = FALSE
      ORDER BY start_date DESC
    `,
      [today]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching active competitions:", err);
    res.status(500).json({ error: "Failed to fetch competitions" });
  }
};

//---Create Competition---//
exports.createCompetition = async (req, res) => {
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  // Basic validation
  if (!name || !start_date || !end_date) {
    return res
      .status(400)
      .json({ error: "Name, start date, and end date are required" });
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res
      .status(400)
      .json({ error: "Start date must be before end date" });
  }

  try {
    if (!(await checkAdminAccess(userId, res))) return;

    const activeCount = await checkActiveCompetition();
    if (activeCount > 0) {
      return res.status(409).json({
        error:
          "An active competition already exists. Only one active competition is allowed at a time.",
      });
    }

    const result = await db.query(
      "INSERT INTO competitions (name, description, start_date, end_date, prize, is_archived) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, description, start_date, end_date, prize, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating competition:", err);
    res.status(500).json({ error: "Failed to create competition" });
  }
};

//---Update Competition---//
exports.updateCompetition = async (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  try {
    if (!(await checkAdminAccess(userId, res))) return;

    const result = await db.query(
      "UPDATE competitions SET name = $1, description = $2, start_date = $3, end_date = $4, prize = $5 WHERE id = $6 AND is_archived = FALSE RETURNING *",
      [name, description, start_date, end_date, prize, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Competition not found or already archived" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating competition:", err);
    res.status(500).json({ error: "Failed to update competition" });
  }
};

//---Delete Competition---//
exports.deleteCompetition = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    if (!(await checkAdminAccess(userId, res))) return;

    const result = await db.query(
      "DELETE FROM competitions WHERE id = $1 AND is_archived = FALSE RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Competition not found or already archived" });
    }

    res.json({ message: "Competition deleted successfully" });
  } catch (err) {
    console.error("Error deleting competition:", err);
    res.status(500).json({ error: "Failed to delete competition" });
  }
};

//---Get competition history (archived competitions)---//
exports.getHistoryCompetitions = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.start_date, 
        c.end_date, 
        c.prize,
        c.winner_user_id,
        c.drawn_at,
        u.first_name,
        u.last_name
      FROM competitions c
      LEFT JOIN users u ON c.winner_user_id = u.id
      WHERE c.is_archived = TRUE
      ORDER BY c.drawn_at DESC, c.end_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching competition history:", err);
    res.status(500).json({ error: "Failed to fetch history competitions" });
  }
};
