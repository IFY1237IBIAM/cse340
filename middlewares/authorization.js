const jwt = require("jsonwebtoken");
require("dotenv").config();

function checkAccountType(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect("/account/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.flash("notice", "Invalid session. Please log in again.");
      return res.redirect("/account/login");
    }

    console.log('Decoded token payload:', decoded);
    const account_type = decoded.account_type;
    console.log('Account type:', account_type);

    if (account_type === "Employee" || account_type === "Admin") {
      // Authorized
      next();
    } else {
      // Not authorized
      req.flash("notice", "You do not have permission to access this page.");
      return res.redirect("/account/login");
    }
  });
}

module.exports = { checkAccountType };