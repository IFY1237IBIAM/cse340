const invModel = require("../models/inventory-model");
const Util = {};

/* ******************************
 * Constructs the nav HTML unordered list
 ****************************** */
Util.getNav = async function () { 
  try {
    const data = await invModel.getClassifications();
    if (!data || data.length === 0) {
      console.error("getNav Error: No classifications found.");
      return "<ul><li>No classifications available</li></ul>";
    }

    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.forEach((row) => {
      list += `<li>
                 <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
                   ${row.classification_name}
                 </a>
               </li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav Error:", error);
    return "<ul><li>Error loading navigation</li></ul>";
  }
};

Util.buildClassificationGrid = async function (data) {
  let grid = "" // Initialize grid to prevent "undefined" errors
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
        + ' details"><img src="' + vehicle.inv_thumbnail 
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
        + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}
Util.buildVehicleHTML = function (vehicle) {
  return `
    <div class="vehicle-details">
      <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
      <p><strong>Year:</strong> ${vehicle.inv_year}</p>
      <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
    </div>
  `
}

/* ******************************
 * Build classification list for select dropdown
 ****************************** */
Util.buildClassificationList = async function () {
  try {
    let data = await invModel.getClassifications();
    console.log("✅ Classification List Data:", data); // Debugging log

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ No classifications found.");
      return [];  // Return empty array if no data
    }

    // Return the array of classification data, not HTML
    return data;  
  } catch (error) {
    console.error("❌ Error fetching classifications:", error);
    return [];  // Return empty array on error
  }
};


Util.handleErrors = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

/* ******************************
 * Exporting the Util object properly
 ****************************** */
module.exports = Util;
