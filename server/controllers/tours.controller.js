const db = require("../database");

//---Create Tour Route---\\
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

//---Get My Tours Route---\\
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
