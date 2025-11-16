-- Fire Assessment Database Schema
-- PostgreSQL 14+

-- Create Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name VARCHAR(255) NOT NULL,
  property_address TEXT,
  client_name VARCHAR(255),
  assessment_date TIMESTAMP,
  assessor_name VARCHAR(255),
  assessor_credentials TEXT,
  status VARCHAR(50) DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Floors table
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  floor_number INTEGER,
  floor_name VARCHAR(255),
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Create Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL,
  room_number INTEGER,
  room_name VARCHAR(255),
  room_type VARCHAR(100),
  dimensions VARCHAR(255),
  actual_length NUMERIC(10, 2),
  actual_width NUMERIC(10, 2),
  schematic_layout JSONB,
  connections TEXT[],
  inspection_status VARCHAR(50) DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Create Fire Safety Items table
CREATE TABLE IF NOT EXISTS fire_safety_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  item_code VARCHAR(100) UNIQUE,
  item_number INTEGER,
  item_type VARCHAR(100),
  location_description TEXT,
  location_on_schematic JSONB,
  status VARCHAR(50) DEFAULT 'pass',
  failure_reason TEXT,
  remedial_action TEXT,
  priority VARCHAR(50),
  requires_action BOOLEAN DEFAULT FALSE,
  compliant_with_standard BOOLEAN DEFAULT TRUE,
  last_service_date DATE,
  next_service_due DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  parent_type VARCHAR(50),
  file_path VARCHAR(500),
  thumbnail_path VARCHAR(500),
  caption TEXT,
  annotation_data JSONB,
  taken_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_floors_assessment_id ON floors(assessment_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_fire_safety_items_room_id ON fire_safety_items(room_id);
CREATE INDEX IF NOT EXISTS idx_fire_safety_items_status ON fire_safety_items(status);
CREATE INDEX IF NOT EXISTS idx_photos_parent_id ON photos(parent_id);
