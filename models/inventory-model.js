const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */

async function getClassifications() {
  try {
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");

    console.log("✅ Classification Data:", result.rows); // Debugging log

    return result.rows.length > 0 ? result.rows : []; // Ensure an array is always returned
  } catch (error) {
    console.error("❌ Error in getClassifications:", error);
    return []; // Return empty array instead of undefined
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return result.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    return [];
  }
}

/* ***************************
 *  Get a specific vehicle by inv_id
 * ************************** */
async function getVehicleById(vehicle_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`, 
      [vehicle_id]
    );
    return result.rows[0]; // Return a single vehicle object
  } catch (error) {
    console.error("getVehicleById error:", error);
    return null;
  }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("DB Error:", error);
    return false;
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(vehicle) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image,inv_thumbnail } = vehicle;

  try {
    // Query to insert a new vehicle into the database
    const result = await pool.query(
      `INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail]
    );
    
    if (result.rowCount > 0) {
      // Return the inserted inventory item
      return { success: true, vehicle: result.rows[0] };
    } else {
      return { success: false, message: "Failed to add the vehicle." };
    }
  } catch (error) {
    console.error("addInventory error:", error);
    return { success: false, message: "Database error occurred while adding the inventory." };
  }
}
/* ***************************
 *  Export functions
 * ************************** */
module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  insertClassification,
  addInventory 
};
