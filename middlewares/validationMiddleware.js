const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

exports.validateClassification = [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required")
    .matches(/^[a-zA-Z0-9]+$/).withMessage("No spaces or special characters allowed"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map(err => err.msg).join(", "));
      return res.redirect("/inv/add-classification");
    }
    next();
  }
];
exports.validateAccountUpdate = [
  // Validate firstname
  body("account_firstname")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2 }).withMessage("First name should be at least 2 characters long"),

  // Validate lastname
  body("account_lastname")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2 }).withMessage("Last name should be at least 2 characters long"),

  // Validate email with uniqueness check
  body("account_email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address")
    .custom(async (value, { req }) => {
      const accountId = req.params.accountId; // Assuming accountId is passed in the URL
      const account = await accountModel.getAccountByEmail(value);
      if (account && account.account_id !== accountId) {
        throw new Error("This email address is already taken");
      }
      return true;
    }),

  // Validate password (only if password is provided)
  body("account_password")
    .optional()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character"),

  // Validate the result of validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map(err => err.msg).join(", "));
      return res.redirect(`/account/update/${req.params.accountId}`); // Redirect back to the update form
    }
    next();
  }
];
