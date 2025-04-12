const accountModel = require("../models/account-model")
const utilities = require(".") // Import utilities
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.LoginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty.")
  ]
}



  validate.checkLogData = async (req, res, next) => {
    const { account_password, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_password,
        account_email,
      })
      return
    }
    next()
  }
  
  
  module.exports = validate