/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
const session = require("express-session");
const pool = require('./database/');
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const baseController = require("./controllers/baseController");
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");  // Inventory routes
const utilities = require("./utilities");  // Utilities module
const accountRoute = require("./routes/accountRoute");  // Account routes
const bodyParser = require("body-parser");


const app = express();

/* ***********************
 * Serve Static Files
 * This will serve our images
 *************************/
app.use(express.static("public"));

/* ***********************
 * Middleware
 ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(utilities.checkJWTToken)
app.use((req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.loggedin = true;
      res.locals.firstname = decoded.firstname; // or use account.firstname
      res.locals.accountType = decoded.account_type;
    } catch (err) {
      res.locals.loggedin = false;
    }
  } else {
    res.locals.loggedin = false;
  }

  next();
});

// Middleware to make nav available to all views
app.use(async (req, res, next) => {
  try {
    const nav = await utilities.getNav(); // Ensure getNav() returns nav HTML
    res.locals.nav = nav; // Makes it available in views
    next();
  } catch (err) {
    console.error("Navigation Middleware Error:", err);
    res.locals.nav = "<ul><li>Error loading navigation</li></ul>";
    next();
  }
});


// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Ensure the layout is correct

/* ***********************
 * Routes
 *************************/
app.use(static);  // Static routes like images
app.use("/inv", inventoryRoute);  // All /inv routes handled by inventoryRoute
app.use("/account", accountRoute);  // Account-related routes

// Route for the home/index page with error handling
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();  // Ensure utilities.getNav() exists
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
  });
});


/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
