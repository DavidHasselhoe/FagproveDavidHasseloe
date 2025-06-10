/*
Har brukt denne logikken i en tidligere oppgave der jeg skulle lage en blog applikasjon,
der man kunne opprette, oppdatere og slette innlegg. Så jeg har tatt utgangspunkt i den koden.
*/

const db = require("../database");

//---Create Tour---//
exports.createTour = async (req, res) => {
  const userId = req.user.id;
  const { competition_id, date, location, description } = req.body;

  if (!competition_id || !date || !location) {
    return res
      .status(400)
      .json({ error: "competition_id, date and location are required" });
  }

  try {
    await db.query(
      "INSERT INTO tours (user_id, competition_id, date, location, description) VALUES ($1, $2, $3, $4, $5)",
      [userId, competition_id, date, location, description || null]
    );
    res.status(201).json({ message: "Tour created successfully" });
  } catch (err) {
    console.error("Error creating tour:", err);
    res.status(500).json({ error: "Failed to create tour" });
  }
};

//---Get My Tours---//
exports.getMyTours = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT * FROM tours WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tours:", err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
};

//---Update Tour---//
exports.updateTour = async (req, res) => {
  const { id } = req.params;
  const { date, location, description } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM tours WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rows.length === 0)
      return res
        .status(403)
        .json({ error: "You do not have permission to update this tour" });

    await db.query(
      "UPDATE tours SET date = $1, location = $2, description = $3 WHERE id = $4",
      [date, location, description, id]
    );
    res.json({ message: "Tour updated" });
  } catch (err) {
    console.error("Error updating tour:", err);
    res.status(500).json({ error: "Failed to update tour" });
  }
};

//---Delete Tour---//
exports.deleteTour = async (req, res) => {
  const userId = req.user.id;
  const tourId = req.params.id;
  try {
    const { rowCount } = await db.query(
      "DELETE FROM tours WHERE id = $1 AND user_id = $2",
      [tourId, userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Tour deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete tour" });
  }
};
