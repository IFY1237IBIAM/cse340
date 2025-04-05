const accountModel = require("../models/account-model")
const utilities = require(".") // Import utilities
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.LoginRules = () => {
  return [
    // First name is required and must be a string

    // Valid email is required and must not already exist
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // Ensures proper email format
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // Password is required and must be strong
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters, with uppercase, lowercase, a number, and a symbol."),
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