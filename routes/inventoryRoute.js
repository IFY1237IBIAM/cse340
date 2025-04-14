const { newInventoryRules, checkInventoryData, checkUpdateData } = require("../utilities/inventory-validation");
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController");
const utilities = require("../utilities"); 
const invValidate = require("../utilities/inventory-validation")
const { validateClassification } = require("../middlewares/validationMiddleware");
// 👇 Import your middleware here
const { checkAccountType } = require("../middlewares/authorization")
// Public route: Classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Public route: Vehicle detail view
router.get("/detail/:inv_id", invController.buildByInvId)

// Admin-only route: Inventory management dashboard
router.get("/", checkAccountType, invController.buildManagementView)

// Admin-only route: Show add classification form
router.get("/add-classification", checkAccountType, invController.showAddClassificationForm)

// Admin-only route: Show add inventory form
router.get("/add-inventory", checkAccountType, invController.showAddInventory)

// Admin-only route: Show edit inventory form
router.get("/edit/:inv_id", checkAccountType, invController.showEditInventoryForm)



// Admin-only route: Handle add classification POST
// router.post("/add-classification",
//   checkAccountType,
//   invValidate.classificationRules(),
//   invValidate.checkClassData,
//   invController.addClassification
// )

// Admin-only route: Handle add inventory POST
// router.post("/add-inventory",
//   checkAccountType,
//   invValidate.inventoryRules(),
//   invValidate.checkInvData,
//   invController.addInventory
// )

// Admin-only route: Handle update inventory POST
// router.post("/update/",
//   checkAccountType,
//   invValidate.inventoryRules(),
//   invValidate.checkUpdateData,
//   invController.updateInventory
// )




// Route for classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/trigger-error", errorController.generateError);

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

// Route to process inventory update
router.post(
  "/update",
  newInventoryRules(),         
  checkUpdateData,             
  utilities.handleErrors(invController.updateInventory)
);
// ✅ NEW: Route to handle delete inventory process
router.post(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventory)
);

// JSON data route for classification inventory
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to load the edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventoryView)
)


router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteInventoryView)
);



module.exports = router;
