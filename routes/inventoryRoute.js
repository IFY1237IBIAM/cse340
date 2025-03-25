const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController"); // ✅ Import errorController

// Route for classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/trigger-error", errorController.generateError); // ✅ Now correctly referenced

module.exports = router;
