const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tours.controller");
const auth = require("../middleware/auth.middleware");

router.post("/tours", auth, toursController.createTour);
router.get("/me/tours", auth, toursController.getMyTours);
router.put("/tours/:id", auth, toursController.updateTour);
router.delete("/tours/:id", auth, toursController.deleteTour);

module.exports = router;
