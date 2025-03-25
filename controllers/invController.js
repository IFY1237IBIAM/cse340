const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  
  if (!data.length) {
    return res.status(404).send("No vehicles found in this classification");
  }

  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const vehicle = await invModel.getVehicleById(inv_id); // Fetch vehicle data

  if (!vehicle) {
    console.log("❌ Vehicle not found for ID:", inv_id);
    return res.status(404).send("Vehicle not found");
  }

  // Convert database field names to match expected names
  const formattedVehicle = {
    make: vehicle.inv_make,
    model: vehicle.inv_model,
    year: vehicle.inv_year,
    description: vehicle.inv_description,
    image: vehicle.inv_image,
    thumbnail: vehicle.inv_thumbnail,
    price: Number(vehicle.inv_price), // Convert price to a number
    miles: vehicle.inv_miles,
    color: vehicle.inv_color,
  };

  console.log("📝 Formatted vehicle data:", formattedVehicle);

  let nav = await utilities.getNav();

  res.render("./inventory/detail", {
    title: `${formattedVehicle.make} ${formattedVehicle.model}`,
    nav,
    vehicle: formattedVehicle, // Pass formatted object
  });
};


// Export functions
module.exports = invCont;
