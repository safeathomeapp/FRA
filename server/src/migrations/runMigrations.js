/**
 * Run Database Migrations
 */

const fs = require('fs');
const path = require('path');
const pool = require('../db/connection');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);
    console.log('✓ Database schema created successfully');

    await pool.end();
    console.log('✓ All migrations complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
