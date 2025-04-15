// const express = require("express");
// const router = new express.Router();
// const accountController = require("../controllers/accountController");
// const regValidate = require("../utilities/account-validation");
// const utilities = require("../utilities/");
// // const  = require("../middlewares/authorization"); // Middleware to verify logged-in users


// // ===== Display Login View =====
// router.get("/login", utilities.handleErrors(accountController.buildLogin));

// // ===== Display Registration View =====
// router.get("/register", utilities.handleErrors(accountController.buildRegister));

// // router.get("/", checkLogin, accountController.buildAccountManagement);

// router.get("/update/:account_id", utilities.checkLogin, accountController.buildUpdateAccountForm)
// // In routes/accountRoute.js
// router.get("/", accountController.buildAccountManagement);

// // Route to handle registration form submission
// router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));
// // Show update form
// router.get("/update/:account_id", utilities.checkLogin, accountController.buildUpdateView);
// router.get("/logout", accountController.logout);

// router.get(
//   "/",
//   utilities.checkJWTToken,
//   utilities.checkLogin,
//   utilities.handleErrors(accountController.buildAccountManagement)
// );


// // Handle info update
// // router.post(
// //   "/update",
// //   regValidate.updateAccountRules(),
// //   regValidate.checkUpdateData,
// //   accountController.updateAccountInfo
// // );

// // Handle password change
// // router.post(
// //   "/update-password",
// //   regValidate.passwordRules(),
// //   regValidate.checkPassword,
// //   accountController.updatePassword
// // );

// // ===== Process Registration =====
// router.post(
//   "/register",
//   regValidate.registrationRules(),
//   regValidate.checkRegData,
//   utilities.handleErrors(accountController.registerAccount)
// );

// // ===== Process Login =====
// router.post(
//   "/login",
//   regValidate.loginRules(),
//   regValidate.checkLogData,
//   utilities.handleErrors(accountController.accountLogin)
// );

// // ===== Logout =====
// router.get("/logout", utilities.handleErrors(accountController.logout));

// // ===== Account Management View (requires login) =====
// // router.get(
// //   "/",
// //   checkLogin,
// //   utilities.handleErrors(accountController.buildAccountManagement)
// // );


// module.exports = router;






const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const utilities = require("../utilities/");
const { checkAccountType } = require("../middlewares/authorization");

// ===== Display Login and Registration Views =====
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.get("/manage", utilities.checkJWTToken, checkAccountType, utilities.handleErrors(accountController.buildAccountManagement));

router.get("/logout", utilities.handleErrors(accountController.logout));

router.get("/account-list", utilities.handleErrors(accountController.buildAccountList));



router.get("/confirm-deactivate/:account_id", utilities.checkJWTToken, utilities.checkLogin, utilities.checkAccountType(["Admin", "Employee", "client"]), accountController.buildDeactivateConfirm);
router.post("/deactivate", utilities.checkJWTToken, utilities.checkLogin, utilities.checkAccountType(["Admin", "Employee", "client"]), accountController.deactivateAccount);
// Confirmation page
// Show confirmation page for deactivation



// ===== Process Login and Registration =====
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
);

// ===== Logout =====

// ===== Account Management View (requires login) =====
router.get(
  "/",
  utilities.checkJWTToken,
  checkAccountType,
  utilities.handleErrors(accountController.buildAccountManagement)
);


// ===== Account Info Update View (requires login) =====
router.get(
  "/update/:account_id",
  checkAccountType,
  utilities.handleErrors(accountController.buildUpdateView)
);

// ===== Handle Info Update =====
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// ===== Handle Password Change =====
router.post(
  "/update-password",
  regValidate.passwordRules(),
  regValidate.checkPassword,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;