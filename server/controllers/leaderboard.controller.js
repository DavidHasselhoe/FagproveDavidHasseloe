const db = require("../database");

exports.getLeaderboard = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.first_name, u.last_name, COUNT(t.id) AS tour_count
      FROM users u
      LEFT JOIN tours t ON t.user_id = u.id
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY tour_count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
