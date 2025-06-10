const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tours.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, toursController.createTour);
router.get("/", auth, toursController.getMyTours);
router.put("/:id", auth, toursController.updateTour);
router.delete("/:id", auth, toursController.deleteTour);
module.exports = router;
