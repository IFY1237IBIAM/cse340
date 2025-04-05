const { body, validationResult } = require("express-validator");

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
