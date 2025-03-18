const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * SSL is required for Render's PostgreSQL
 * *************** */
const isDevelopment = process.env.NODE_ENV === "development";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDevelopment
    ? { rejectUnauthorized: false } // Use SSL in development
    : { rejectUnauthorized: false }, // Also enforce SSL in production
});

// Added for troubleshooting queries during development
if (isDevelopment) {
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("Executed Query:", { text });
        return res;
      } catch (error) {
        console.error("Error in Query:", { text });
        throw error;
      }
    },
  };
} else {
  module.exports = pool;
}
