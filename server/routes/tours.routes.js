const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tours.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, toursController.createTour);
router.get("/", authMiddleware, toursController.getMyTours);
router.put("/:id", authMiddleware, toursController.updateTour);
router.delete("/:id", authMiddleware, toursController.deleteTour);
module.exports = router;
