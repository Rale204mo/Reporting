const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
});

module.exports = pool;
