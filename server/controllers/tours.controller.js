/*
Har brukt denne logikken i en tidligere oppgave der jeg skulle lage en blog applikasjon,
der man kunne opprette, oppdatere og slette innlegg. Så jeg har tatt utgangspunkt i den koden.
*/

const db = require("../database");

//---Get My Tours---//
exports.getMyTours = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT t.*, c.name as competition_name 
       FROM tours t 
       LEFT JOIN competitions c ON t.competition_id = c.id 
       WHERE t.user_id = $1 
       ORDER BY t.date DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tours:", err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
};

//---Create Tour---//
exports.createTour = async (req, res) => {
  const { date, location, description, competition_id } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `INSERT INTO tours (user_id, date, location, description, competition_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, date, location, description, competition_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating tour:", err);
    res.status(500).json({ error: "Failed to create tour" });
  }
};

//---Update Tour---//
exports.updateTour = async (req, res) => {
  const { id } = req.params;
  const { date, location, description, competition_id } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `UPDATE tours 
       SET date = $1, location = $2, description = $3, competition_id = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [date, location, description, competition_id, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating tour:", err);
    res.status(500).json({ error: "Failed to update tour" });
  }
};

//---Delete Tour---//
exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM tours WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    console.error("Error deleting tour:", err);
    res.status(500).json({ error: "Failed to delete tour" });
  }
};

//---Get Single Tour (for editing)---//
exports.getTour = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT t.*, c.name as competition_name 
       FROM tours t 
       LEFT JOIN competitions c ON t.competition_id = c.id 
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching tour:", err);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
};
