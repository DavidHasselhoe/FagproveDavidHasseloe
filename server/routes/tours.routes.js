const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tours.controller");
const auth = require("../middleware/auth.middleware");

router.post("/tours", auth, toursController.createTour);


module.exports = router;