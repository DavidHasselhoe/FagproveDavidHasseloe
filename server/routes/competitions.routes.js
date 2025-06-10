// competitions.routes.js
const express = require("express");
const router = express.Router();
const competitionsController = require("../controllers/competitions.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, competitionsController.getCompetitions);
router.post("/", authMiddleware, competitionsController.createCompetition);
router.put("/:id", authMiddleware, competitionsController.updateCompetition);
router.delete("/:id", authMiddleware, competitionsController.deleteCompetition);

module.exports = router;
