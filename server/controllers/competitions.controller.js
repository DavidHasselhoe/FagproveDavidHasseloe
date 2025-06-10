/*
Har brukt denne logikken i en tidligere oppgave der jeg skulle lage en blog applikasjon,
der man kunne opprette, oppdatere og slette innlegg. Så jeg har tatt utgangspunkt i den koden.
*/

const db = require("../database");

//---Get only ACTIVE competitions---//
exports.getCompetitions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { rows } = await db.query(`
      SELECT * FROM competitions 
      WHERE start_date <= $1 AND end_date >= $1
      ORDER BY start_date DESC
    `, [today]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error fetching active competitions:", err);
    res.status(500).json({ error: "Failed to fetch competitions" });
  }
};

//---Create Competition (admin only)---//
exports.createCompetition = async (req, res) => {
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  try {
    //---Check if user is admin---//
    const userResult = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: "Only administrators can create competitions" });
    }

    //---Check if any ACTIVE competition already exists---//
    const today = new Date().toISOString().split('T')[0];
    const activeCompetition = await db.query(`
      SELECT COUNT(*) as count FROM competitions 
      WHERE start_date <= $1 AND end_date >= $1
    `, [today]);

    if (parseInt(activeCompetition.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: "An active competition already exists. Only one active competition is allowed at a time." 
      });
    }

    //---Create the competition---//
    const result = await db.query(
      "INSERT INTO competitions (name, description, start_date, end_date, prize) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, description, start_date, end_date, prize]
    );
    res.status(201).json(result.rows[0]);
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
    //---Check if user is admin---//
    const userResult = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: "Only administrators can update competitions" });
    }

    //---Update the competition---//
    const result = await db.query(
      "UPDATE competitions SET name = $1, description = $2, start_date = $3, end_date = $4, prize = $5 WHERE id = $6 RETURNING *",
      [name, description, start_date, end_date, prize, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Competition not found" });
    }

    res.json(result.rows[0]);
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
    //---Check if user is admin---//
    const userResult = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: "Only administrators can delete competitions" });
    }

    //---Delete the competition---//
    const result = await db.query(
      "DELETE FROM competitions WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Competition not found" });
    }

    res.json({ message: "Competition deleted successfully" });
  } catch (err) {
    console.error("Error deleting competition:", err);
    res.status(500).json({ error: "Failed to delete competition" });
  }
};

//---Get finished competitions---//
exports.getHistoryCompetitions = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM competitions
      WHERE end_date < CURRENT_DATE
      ORDER BY end_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching finished competitions:", err);
    res.status(500).json({ error: "Failed to fetch history competitions" });
  }
};
