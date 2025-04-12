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
    const classificationList = await utilities.buildClassificationList();

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList, // 
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

/* ***************************
 * Return Inventory JSON Data
 * ************************** */
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

// Deliver edit view for an inventory item


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      throw new Error("Inventory item not found.");
    }

    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,

      // Pass all vehicle data for pre-filling form
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error building edit view:", error);
    next(error);
  }
};

invCont.showEditInventoryForm = async (req, res) => {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      req.flash("error", "Vehicle not found");
      return res.redirect("/inv/management");
    }

    const classificationList = await utilities.buildClassificationList(vehicle.classification_id);
    const nav = await utilities.getNav();

    res.render("inventory/edit-inventory", {
      title: `Edit ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      classificationList,
      messages: req.flash(),

      // Pass these directly to populate the form
      inv_id: vehicle.inv_id,
      classification_id: vehicle.classification_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_description: vehicle.inv_description,
      inv_price: vehicle.inv_price,
      inv_miles: vehicle.inv_miles,
      inv_color: vehicle.inv_color,
      inv_image: vehicle.inv_image,
      inv_thumbnail: vehicle.inv_thumbnail,
    });
  } catch (error) {
    console.error("Error loading edit form:", error);
    req.flash("error", "Server error while loading the edit form");
    res.redirect("/inv/management");
  }
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList: classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      throw new Error("Inventory item not found.");
    }

    const nav = await utilities.getNav();
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/delete-confirmation", {
      title: "Delete " + itemName,
      nav,
      errors: null,

      // Pass all necessary vehicle data for display only
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error building delete view:", error);
    next(error);
  }
};

/* ***************************
 *  Handle Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async (req, res) => {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventoryItem(inv_id); 

    if (deleteResult) {
      req.flash("success", "Inventory item deleted successfully.");
      return res.redirect("/inv/management");
    } else {
      req.flash("error", "Failed to delete inventory item.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    req.flash("error", "Server error while deleting. Please try again.");
    res.redirect(`/inv/delete/${req.body.inv_id}`);
  }
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const accountData = res.locals.accountData; // ✅ grab account data from locals

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      accountData, // ✅ pass it to the view
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error loading management view:", error);
    res.status(500).send("Server Error");
  }
};

// ✅ Export functions
module.exports = invCont;
