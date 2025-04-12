const accountModel = require("../models/account-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* **********************************
 *  Registration Data Validation Rules
 *********************************** */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),

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
      .withMessage(
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and symbol."
      ),
  ]
}

/* **********************************
 *  Login Data Validation Rules
 *********************************** */
validate.loginRules = () => {
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

/* **********************************
 *  Update Account Info Validation Rules
 *********************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email")
      .isEmail()
      .withMessage("Valid email is required.")
      .custom(async (account_email, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(account_email)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email already exists.")
        }
      }),
  ]
}

/* **********************************
 *  Password Update Validation Rules
 *********************************** */
validate.passwordRules = () => {
  return [
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
      .withMessage(
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and symbol."
      ),
  ]
}

/* ******************************
 * Check registration validation result
 ******************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check login validation result
 ******************************* */
validate.checkLogData = async (req, res, next) => {
  const { account_email, account_password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
      account_password,
    })
    return
  }
  next()
}

/* ******************************
 * Check update info validation result
 ******************************* */
validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check password update validation result
 ******************************* */
validate.checkPassword = async (req, res, next) => {
  const { account_id, account_password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Change Password",
      nav,
      account_id,
    })
    return
  }
  next()
}

module.exports = validate
