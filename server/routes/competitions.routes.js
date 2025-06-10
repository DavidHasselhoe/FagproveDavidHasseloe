const express = require("express");
const router = express.Router();
const competitionsController = require("../controllers/competitions.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", competitionsController.getCompetitions);
router.get("/history", competitionsController.getHistoryCompetitions);
router.post("/", auth, competitionsController.createCompetition);
router.put("/:id", auth, competitionsController.updateCompetition);
router.delete("/:id", auth, competitionsController.deleteCompetition);

module.exports = router;
