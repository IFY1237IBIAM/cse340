/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const baseController = require("./controllers/baseController");
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities"); // Ensure this module exists and exports `getNav`

const app = express();

/* ***********************
 * Serve Static Files
 * This will serve our images
 *************************/
app.use(express.static("public"));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
// Inventory routes
app.use("/inv", inventoryRoute);

// Route for the home/index page with error handling
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
   next({status: 404, message: 'Sorry, we appear to have lost that page.'})
 });

/* ***********************
 * Express Error Handler
 * Place after all other middleware
//  *************************/
app.use(async (err, req, res, next) => {
   let nav = await utilities.getNav(); // Ensure utilities.getNav() exists
   console.error(`Error at: "${req.originalUrl}": ${err.message}`);
   if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
   res.render("errors/error", {
     title: err.status || 'Server Error',
     message,
     nav
   })
 })

 // Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  
  res.status(500).render("errors/500", {
    title: "Server Error",
    message: err.message,
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
