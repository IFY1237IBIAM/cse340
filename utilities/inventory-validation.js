const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");

/* ******************************
 * Inventory Data Validation Rules
 * ***************************** */
const newInventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),

    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please enter a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),

    body("inv_image")
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .notEmpty()
      .withMessage("Thumbnail path is required.")
  ];
};

/* ******************************
 * Check data and return errors for Add Inventory
 * ***************************** */
const checkInventoryData = async (req, res, next) => {
  let { classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_price, inv_miles, inv_color, inv_image, inv_thumbnail } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classifications = await invModel.getClassifications();

    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      classifications,
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    });
  }
  next();
};

/* ******************************
 * Check data and return errors for Update Inventory (redirects to Edit view)
 * ***************************** */
const checkUpdateData = async (req, res, next) => {
  let { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_price, inv_miles, inv_color, inv_image, inv_thumbnail } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classifications = await invModel.getClassifications();

    return res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      classifications,
      errors: errors.array(),
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    });
  }
  next();
};

module.exports = {
  newInventoryRules,
  checkInventoryData,
  checkUpdateData,
};
