/**
 * Seed Database with Sample Data
 */

const pool = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  try {
    console.log('Seeding database with sample data...');

    // Sample Assessment
    const assessmentId = uuidv4();
    await pool.query(
      `INSERT INTO assessments (id, property_name, property_address, assessor_name, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [assessmentId, 'Sample Building', '123 Main Street', 'Demo Assessor', 'in_progress']
    );
    console.log('✓ Sample assessment created');

    // Sample Floor
    const floorId = uuidv4();
    await pool.query(
      `INSERT INTO floors (id, assessment_id, floor_number, floor_name)
       VALUES ($1, $2, $3, $4)`,
      [floorId, assessmentId, 1, 'Ground Floor']
    );
    console.log('✓ Sample floor created');

    // Sample Room
    const roomId = uuidv4();
    await pool.query(
      `INSERT INTO rooms (id, floor_id, room_name, room_type, dimensions)
       VALUES ($1, $2, $3, $4, $5)`,
      [roomId, floorId, 'Main Corridor', 'corridor', '40m x 2m']
    );
    console.log('✓ Sample room created');

    await pool.end();
    console.log('✓ Database seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedData();
