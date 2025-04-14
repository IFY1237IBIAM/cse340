const pool = require("../database/"); // Import the database connection

/* *****************************
*   Register new account
* *************************** */
// async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
//   try {
//     const sql = `
//       INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
//       VALUES ($1, $2, $3, $4, 'client')
//       RETURNING *`; // Returning all inserted data

//     return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
//   } catch (error) {
//     return error.message;
//   }
// }
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type, account_active) VALUES ($1, $2, $3, $4, 'client', true) RETURNING *`;
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


// Function to update account information
async function updateAccount(account_id, account_firstname, account_lastname,account_email) {
  const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
  const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
  return result.rowCount;
}

// Function to update password
async function updateAccountPassword(account_id, hashedPassword) {
  const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
  const result = await pool.query(sql, [hashedPassword, account_id]);
  return result.rowCount;
}


// Function to get account by ID
async function getAccountById(account_id) {
  const result = await pool.query(
    "SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1",
    [account_id]
  );
  return result.rows[0];
}



// async function getAllAccounts() {
//   try {
//     const result = await pool.query(
//       'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_lastname'
//     );
//     return result.rows;
//   } catch (error) {
//     console.error('getAllAccounts error:', error);
//     throw new Error('Database error getting all accounts');
//   }
// }

async function getAllAccounts() {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_active = true ORDER BY account_lastname'
    );
    return result.rows;
  } catch (error) {
    console.error('getAllAccounts error:', error);
    throw new Error('Database error getting all accounts');
  }
}

async function getAccountsByType(type) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_type = $1',
      [type]
    );
    return result.rows;
  } catch (error) {
    console.error('getAccountsByType error:', error);
    throw new Error('Database error filtering accounts');
  }
}

async function deactivateAccount(account_id) {
  try {
    const sql = `UPDATE account SET account_active = false WHERE account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Deactivate DB Error:", error);
    throw error;
  }
}



module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, updateAccountPassword, getAccountById, getAllAccounts, getAccountsByType, deactivateAccount }; // Export the function