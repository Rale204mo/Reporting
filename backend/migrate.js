
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async ()=>{
  const sql = fs.readFileSync(__dirname + '/..' + '/db/create_tables.sql','utf8');
  try {
    await pool.query(sql);
    console.log('Migrations applied');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
