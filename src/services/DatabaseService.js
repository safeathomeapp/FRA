/**
 * DatabaseService - SQLite Database Management
 * Handles local data persistence on the phone
 */

import SQLite from 'react-native-sqlite-storage';

const DB_NAME = 'fire_assessments.db';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database and create tables if needed
   */
  async initializeDatabase() {
    try {
      SQLite.enablePromise(true);
      this.db = await SQLite.openDatabase(
        {
          name: DB_NAME,
          location: 'default',
        },
        () => {
          console.log('Database opened successfully');
        },
        error => {
          console.error('Error opening database:', error);
        }
      );

      await this.createTables();
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  /**
   * Create database tables if they don't exist
   */
  async createTables() {
    try {
      // Assessments table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS assessments (
          id TEXT PRIMARY KEY,
          property_name TEXT NOT NULL,
          property_address TEXT,
          client_name TEXT,
          assessment_date DATETIME,
          assessor_name TEXT,
          assessor_credentials TEXT,
          status TEXT DEFAULT 'in_progress',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Floors table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS floors (
          id TEXT PRIMARY KEY,
          assessment_id TEXT NOT NULL,
          floor_number INTEGER,
          floor_name TEXT,
          is_template BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        );
      `);

      // Rooms table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          floor_id TEXT NOT NULL,
          room_number INTEGER,
          room_name TEXT,
          room_type TEXT,
          dimensions TEXT,
          actual_length REAL,
          actual_width REAL,
          schematic_layout TEXT,
          connections TEXT,
          inspection_status TEXT DEFAULT 'not_started',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (floor_id) REFERENCES floors(id)
        );
      `);

      // Fire Safety Items table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS fire_safety_items (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          item_code TEXT UNIQUE,
          item_number INTEGER,
          item_type TEXT,
          location_description TEXT,
          location_on_schematic TEXT,
          status TEXT DEFAULT 'pass',
          failure_reason TEXT,
          remedial_action TEXT,
          priority TEXT,
          requires_action BOOLEAN DEFAULT 0,
          compliant_with_standard BOOLEAN DEFAULT 1,
          last_service_date DATE,
          next_service_due DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms(id)
        );
      `);

      // Photos table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY,
          parent_id TEXT NOT NULL,
          parent_type TEXT,
          file_path TEXT,
          thumbnail_path TEXT,
          caption TEXT,
          annotation_data TEXT,
          taken_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('All tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Execute a SQL query
   */
  async execute(sql, params = []) {
    try {
      const result = await this.db.executeSql(sql, params);
      return result;
    } catch (error) {
      console.error('SQL Error:', error);
      throw error;
    }
  }

  /**
   * Close the database
   */
  async closeDatabase() {
    try {
      if (this.db) {
        await this.db.close();
        console.log('Database closed');
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

export default new DatabaseService();
