const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");


const invCont = {}; // ✅ Correct object name

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data.length) {
      return res.status(404).send("No vehicles found in this classification");
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error fetching classification inventory:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      console.log("❌ Vehicle not found for ID:", inv_id);
      return res.status(404).send("Vehicle not found");
    }

    const formattedVehicle = {
      make: vehicle.inv_make,
      model: vehicle.inv_model,
      year: vehicle.inv_year,
      description: vehicle.inv_description,
      image: vehicle.inv_image,
      thumbnail: vehicle.inv_thumbnail,
      price: Number(vehicle.inv_price),
      miles: vehicle.inv_miles,
      color: vehicle.inv_color,
    };

    let nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${formattedVehicle.make} ${formattedVehicle.model}`,
      nav,
      vehicle: formattedVehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error loading management view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Show Add Classification Form
 * ************************** */
invCont.showAddClassificationForm = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error loading classification form:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Handle Classification Form Submission
 * ************************** */
invCont.addClassification = async (req, res) => {
  try {
    const { classification_name } = req.body;
    const result = await invModel.insertClassification(classification_name);

    if (result) {
      req.flash("success", "Classification added successfully!");
      return res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add classification.");
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Show Add Inventory Form
 * ************************** */
invCont.showAddInventory = async (req, res) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav(); // ✅ required for navigation.ejs

    // Pass classificationList as raw data
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      classificationList,  // Raw data passed
      nav, // ✅ passed to layout
      messages: req.flash(),

      // Form defaults
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "",
      inv_thumbnail: ""
    });
  } catch (error) {
    console.error("Error loading form:", error);
    res.status(500).send("Server Error");
  }
};




/* ***************************
 *  Handle Add Inventory Submission
 * ************************** */
invCont.addInventory = async (req, res) => {
  try {
    const { 
      classification_id, 
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_price, 
      inv_miles, 
      inv_color, 
      inv_image, 
      inv_thumbnail // Add inv_thumbnail here
    } = req.body;

    // Check if mandatory fields are present
    if (!classification_id || !inv_make || !inv_model || !inv_year || !inv_description || !inv_price || !inv_miles || !inv_color || !inv_image || !inv_thumbnail) {
      req.flash("error", "All fields except thumbnail are required.");
      return res.redirect("/inv/add-inventory");
    }

    // Ensure inv_thumbnail is included in the object passed to the model (even if it's empty or null)
    const result = await invModel.addInventory({
      classification_id, 
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_price, 
      inv_miles, 
      inv_color, 
      inv_image, 
      inv_thumbnail
    });
    
    if (result.success) {
      req.flash("success", "Vehicle added successfully!");
      res.redirect("/inv/management");
    } else {
      req.flash("error", result.message || "Failed to add vehicle.");
      const classificationList = await utilities.buildClassificationList(classification_id);
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        classificationList,
        messages: req.flash(),
        ...req.body,
      });
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("error", "Server error, please try again.");
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      classificationList,
      messages: req.flash(),
      ...req.body,
    });
  }
};

// ✅ Export functions
module.exports = invCont;
