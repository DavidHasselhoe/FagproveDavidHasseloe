const db = require("../database");

exports.getLeaderboard = async (req, res) => {
  try {
    const { competition_id } = req.query;
    let sql = `
      SELECT u.id, u.first_name, u.last_name, COUNT(t.id)::int AS tour_count
      FROM users u
      LEFT JOIN tours t ON t.user_id = u.id
    `;
    const params = [];
    if (competition_id) {
      sql += ` AND t.competition_id = $1`;
      params.push(competition_id);
    }
    sql += `
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY tour_count DESC
    `;
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
