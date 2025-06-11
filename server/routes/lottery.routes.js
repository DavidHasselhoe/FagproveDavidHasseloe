const express = require("express");
const router = express.Router();
const lotteryController = require("../controllers/lottery.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", lotteryController.getLotteryData);
router.get("/history", lotteryController.getLotteryHistory); 
router.post("/draw", authMiddleware, lotteryController.performDraw);

module.exports = router;
