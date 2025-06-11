const db = require("../database");

//---Get lottery data for active competition---//
exports.getLotteryData = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    //---Combined query to get both active and recently archived competitions---//
    const competitionResult = await db.query(
      `
      SELECT 
        c.id, c.name, c.prize, c.winner_user_id, c.drawn_at, c.is_archived,
        u.first_name as winner_first_name, u.last_name as winner_last_name
      FROM competitions c
      LEFT JOIN users u ON c.winner_user_id = u.id
      WHERE 
        (c.start_date <= $1 AND c.end_date >= $1 AND c.is_archived = FALSE) OR
        (c.drawn_at >= $1 AND c.winner_user_id IS NOT NULL)
      ORDER BY 
        CASE WHEN c.is_archived = FALSE THEN 0 ELSE 1 END,
        c.drawn_at DESC
      LIMIT 1
    `,
      [today]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ error: "No active competition found" });
    }

    const competition = competitionResult.rows[0];

    //---Get participants with a single query---//
    const participantsResult = await db.query(
      `
      SELECT 
        u.id, u.first_name, u.last_name,
        COUNT(t.id) as tour_count
      FROM users u
      INNER JOIN tours t ON u.id = t.user_id AND t.competition_id = $1
      GROUP BY u.id, u.first_name, u.last_name
      HAVING COUNT(t.id) > 0
      ORDER BY tour_count DESC
    `,
      [competition.id]
    );

    const totalTickets = participantsResult.rows.reduce(
      (sum, user) => sum + parseInt(user.tour_count),
      0
    );

    const participants = participantsResult.rows.map((user) => ({
      ...user,
      tickets: parseInt(user.tour_count),
      chance:
        totalTickets > 0
          ? ((parseInt(user.tour_count) / totalTickets) * 100).toFixed(1)
          : "0",
    }));

    const response = {
      competition: {
        id: competition.id,
        name: competition.name,
        prize: competition.prize,
      },
      participants,
      totalTickets,
      isDrawn: !!competition.winner_user_id,
      isArchived: competition.is_archived,
    };

    if (competition.winner_user_id) {
      response.winner = {
        id: competition.winner_user_id,
        name: `${competition.winner_first_name} ${competition.winner_last_name}`,
        drawnAt: competition.drawn_at,
      };
    }

    res.json(response);
  } catch (err) {
    console.error("Error fetching lottery data:", err);
    res.status(500).json({ error: "Failed to fetch lottery data" });
  }
};

//---Get lottery history---//
exports.getLotteryHistory = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT 
        c.id,
        c.name,
        c.prize,
        c.start_date,
        c.end_date,
        c.drawn_at,
        u.first_name,
        u.last_name
      FROM competitions c
      LEFT JOIN users u ON c.winner_user_id = u.id
      WHERE c.is_archived = TRUE AND c.winner_user_id IS NOT NULL
      ORDER BY c.drawn_at DESC
      LIMIT 10
    `
    );

    const history = rows.map((comp) => ({
      id: comp.id,
      name: comp.name,
      prize: comp.prize,
      winner: `${comp.first_name} ${comp.last_name}`,
      drawnAt: comp.drawn_at,
    }));

    res.json(history);
  } catch (err) {
    console.error("Error fetching lottery history:", err);
    res.status(500).json({ error: "Failed to fetch lottery history" });
  }
};

//---Perform lottery draw (admin only)---//
exports.performDraw = async (req, res) => {
  const userId = req.user.id;

  try {
    //---Check admin status---//
    const userResult = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res
        .status(403)
        .json({ error: "Only administrators can perform lottery draws" });
    }

    //---Get active competition---//
    const today = new Date().toISOString().split("T")[0];
    const competitionResult = await db.query(
      `
      SELECT id, name, winner_user_id FROM competitions 
      WHERE start_date <= $1 AND end_date >= $1 AND is_archived = FALSE
      LIMIT 1
    `,
      [today]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ error: "No active competition found" });
    }

    const competition = competitionResult.rows[0];

    if (competition.winner_user_id) {
      return res
        .status(409)
        .json({ error: "Lottery draw already performed for this competition" });
    }

    //---Get participants---//
    const participantsResult = await db.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(t.id) as tour_count
      FROM users u
      INNER JOIN tours t ON u.id = t.user_id AND t.competition_id = $1
      GROUP BY u.id, u.first_name, u.last_name
      HAVING COUNT(t.id) > 0
    `,
      [competition.id]
    );

    if (participantsResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "No participants found for lottery draw" });
    }

    //---Create weighted lottery---//
    const tickets = [];
    participantsResult.rows.forEach((user) => {
      const tourCount = parseInt(user.tour_count);
      for (let i = 0; i < tourCount; i++) {
        tickets.push(user);
      }
    });

    //---Draw winner---//
    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winner = tickets[randomIndex];

    //---Start transaction---//
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const drawTime = new Date();

      //---Update competition with winner and archive it---//
      await client.query(
        "UPDATE competitions SET winner_user_id = $1, drawn_at = $2, is_archived = TRUE WHERE id = $3",
        [winner.id, drawTime, competition.id]
      );

      await client.query("COMMIT");

      res.json({
        competition: {
          id: competition.id,
          name: competition.name,
        },
        winner: {
          id: winner.id,
          name: `${winner.first_name} ${winner.last_name}`,
          tickets: parseInt(winner.tour_count),
          totalTickets: tickets.length,
        },
        drawTime: drawTime.toISOString(),
        message:
          "Competition archived - admin can now create a new competition",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error performing lottery draw:", err);
    res.status(500).json({ error: "Failed to perform lottery draw" });
  }
};
