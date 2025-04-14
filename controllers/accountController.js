const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    
    // Hash the password before storing
    let hashedPassword
    try {
        // Hash the password with a salt factor of 10
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }


  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


/* ****************************************
 *  Deliver account management view
 * *************************************** */
/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
const buildAccountManagement = async function (req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData // populated by JWT middleware

  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData, // pass this to the view
    errors: null,
    messages: req.flash()
  })
}
const buildAccountList = async (req, res) => {
  try {
    const nav = await utilities.getNav()
    const accountList = await accountModel.getAllAccounts()

    res.render("account/account-list", {
      title: "All Accounts",
      nav,
      accountList,
      messages: req.flash(),
      errors: null
    })
  } catch (error) {
    console.error("Error fetching account list:", error)
    req.flash("notice", "Could not retrieve account list.")
    res.redirect("/account")
  }
}

const buildUpdateAccountForm = async (req, res) => {
  const nav = await utilities.getNav()
  const account_id = req.params.account_id

  // You might fetch user info from DB here to pre-fill the form
  const accountData = res.locals.accountData

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    accountData,
    errors: null,
    messages: req.flash()
  })
}
const buildUpdateView = async (req, res) => {
  const account_id = req.params.account_id;
  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/update", {
    title: "Edit Account",
    accountData,
    errors: null,
    messages: req.flash(),
  });
};

const updateAccountInfo = async (req, res) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  if (updateResult) {
    req.flash("notice", "Account info updated successfully.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/management", {
      title: "Account Management",
      accountData,
      messages: req.flash(),
      errors: null
    });
  } else {
    req.flash("notice", "Update failed.");
    return res.redirect(`/account/update/${account_id}`);
  }
};


const updatePassword = async (req, res) => {
  const { account_password, account_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword);
    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
    } else {
      req.flash("notice", "Password update failed.");
    }
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/management", {
      title: "Account Management",
      accountData,
      messages: req.flash(),
      errors: null
    });
  } catch (error) {
    console.error(error);
    req.flash("notice", "Something went wrong.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/management", {
      title: "Account Management",
      accountData,
      messages: req.flash(),
      errors: null
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
};

async function buildDeactivateConfirm(req, res) {
  const account_id = req.params.account_id;
  const account = await accountModel.getAccountById(account_id);
  if (!account) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/account-list");
  }
  res.render("account/confirm-deactivate", {
    title: "Confirm Deactivation",
    account,
  });
}

async function deactivateAccount(req, res) {
  const account_id = req.body.account_id;
  try {
    const success = await accountModel.deactivateAccount(account_id);
    if (success) {
      req.flash("notice", "Account successfully deactivated.");
    } else {
      req.flash("notice", "Deactivation failed.");
    }
    res.redirect("/account/account-list");
  } catch (error) {
    console.error("Deactivate Error:", error);
    req.flash("notice", "An error occurred.");
    res.redirect("/account/account-list");
  }
}





module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin,
  buildAccountManagement,
  buildAccountList,
  buildUpdateAccountForm,
  buildUpdateView,
  buildDeactivateConfirm,
  deactivateAccount,
  updateAccountInfo,
  updatePassword,
  logout,
}
