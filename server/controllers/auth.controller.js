//Registrering og Login har jeg tidligere brukt i en annen oppgave, så jeg har tatt utgangspunkt i den koden.

const bcrypt = require("bcrypt");
const db = require("../database");
const jwt = require("jsonwebtoken");

//---Register Route---//
exports.register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Alle felt er påkrevd" });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "En bruker med denne e-post addressen finnes allerede",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)",
      [first_name, last_name, email, hash]
    );

    res.status(201).json({ message: "Bruker opprettet!" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "En intern feil oppstod" });
  }
};

//---Login Route---//
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-post og passord er påkrevd" });
  }

  try {
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Ugyldige påloggingsopplysninger" });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Ugyldige påloggingsopplysninger" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({ message: "Innlogging vellykket", token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "En intern feil oppstod" });
  }
};

//---Get Profile Route---//
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT id, first_name, last_name, email, is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bruker ikke funnet" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Feil ved henting av profil" });
  }
};
