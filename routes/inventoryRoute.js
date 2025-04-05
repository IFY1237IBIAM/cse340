const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController"); // ✅ Import errorController
const { validateClassification } = require("../middlewares/validationMiddleware");


// Route for classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/trigger-error", errorController.generateError); // ✅ Now correctly referenced
// Route for the management view
router.get("/", invController.buildManagementView);

router.get("/management", invController.buildManagementView);


// Show add classification form
router.get("/add-classification", invController.showAddClassificationForm);

router.get("/add-inventory", invController.showAddInventory);

// Process classification submission with validation middleware
router.post("/add-classification", validateClassification, invController.addClassification);

// Process add inventory submission
router.post("/add-inventory", invController.addInventory);





module.exports = router;
