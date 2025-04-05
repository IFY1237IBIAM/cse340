const regValidate = require('../utilities/account-validation')
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");

// Route to display the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to display the registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister));


// Route to handle registration form submission
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));



// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )

module.exports = router;
