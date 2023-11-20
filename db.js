/** Database for lunchly */

const pg = require('pg');

// Load environment variables
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD;

const db = new pg.Client(
    `postgresql://postgres:${dbPassword}@localhost:5432/lunchly`
);

db.connect();

module.exports = db;
