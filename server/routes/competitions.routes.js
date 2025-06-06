// competitions.routes.js
const express = require("express");
const router = express.Router();
const competitionsController = require("../controllers/competitions.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, competitionsController.getCompetitions);
router.post("/", authMiddleware, competitionsController.createCompetition);

module.exports = router;
