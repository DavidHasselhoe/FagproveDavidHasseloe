const db = require("../database");

// --- Get all competitions --- //
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

// --- Create new competition (admin only, only if none exists) --- //
exports.createCompetition = async (req, res) => {
  const { name, description, start_date, end_date, prize } = req.body;
  const userId = req.user.id;

  try {
    // Check if user exists and is admin
    const { rows: users } = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: "User not found" });
    if (!users[0].is_admin)
      return res
        .status(403)
        .json({ error: "Only administrators can create competitions" });

    // Allow only one competition at a time
    const { rows: countRows } = await db.query(
      "SELECT COUNT(*)::int AS count FROM competitions"
    );
    if (countRows[0].count > 0)
      return res.status(409).json({
        error: "A competition already exists. Only one at a time is allowed.",
      });

    // Create the competition
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
