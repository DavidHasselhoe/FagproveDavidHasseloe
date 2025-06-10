/*
Har brukt denne logikken i en tidligere oppgave der jeg skulle lage en blog applikasjon,
der man kunne opprette, oppdatere og slette innlegg. Så jeg har tatt utgangspunkt i den koden.
*/

const db = require("../database");

//---Get all competitions---//
exports.getCompetitions = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM competitions ORDER BY start_date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching competitions:", err);
    res.status(500).json({ error: "Failed to fetch competitions" });
  }
};

//---Get all active competitions---//
exports.getActiveCompetitions = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM competitions
      WHERE CURRENT_DATE BETWEEN start_date AND end_date
      ORDER BY start_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active competitions" });
  }
};

//---Create Competition (admin only, only if none exists)---//
exports.createCompetition = async (req, res) => {
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  try {
    const { rows: users } = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: "User not found" });
    if (!users[0].is_admin)
      return res
        .status(403)
        .json({ error: "Only administrators can create competitions" });

    const { rows: countRows } = await db.query(
      "SELECT COUNT(*)::int AS count FROM competitions"
    );
    if (countRows[0].count > 0)
      return res.status(409).json({
        error: "A competition already exists. Only one at a time is allowed.",
      });

    //---Create Competition (admin only)---//
    const { rows: created } = await db.query(
      `INSERT INTO competitions (name, description, start_date, end_date, prize)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, start_date, end_date, prize]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    console.error("Error creating competition:", err);
    res.status(500).json({ error: "Failed to create competition" });
  }
};

//---Update Competition (admin only)---//
exports.updateCompetition = async (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  try {
    const { rows: users } = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: "User not found" });
    if (!users[0].is_admin)
      return res.status(403).json({ error: "Only administrators can update competitions" });

    const { rowCount } = await db.query(
      `UPDATE competitions
       SET name = $1, description = $2, start_date = $3, end_date = $4, prize = $5
       WHERE id = $6`,
      [name, description, start_date, end_date, prize, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Competition not found" });

    res.json({ message: "Competition updated successfully" });
  } catch (err) {
    console.error("Error updating competition:", err);
    res.status(500).json({ error: "Failed to update competition" });
  }
};

//---Delete Competition (admin only)---//
exports.deleteCompetition = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { rows: users } = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: "User not found" });
    if (!users[0].is_admin)
      return res.status(403).json({ error: "Only administrators can delete competitions" });

    const { rowCount } = await db.query(
      "DELETE FROM competitions WHERE id = $1",
      [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Competition not found" });

    res.json({ message: "Competition deleted successfully" });
  } catch (err) {
    console.error("Error deleting competition:", err);
    res.status(500).json({ error: "Failed to delete competition" });
  }
};
