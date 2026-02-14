-- Production Tracking System - D1 Database Schema
-- Initialize this schema with: wrangler d1 execute production_tracking --file=schema.sql

-- Products Table
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_number TEXT UNIQUE NOT NULL,
    product_type TEXT NOT NULL CHECK(product_type IN ('AF', 'AOS')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Production Batches Table
CREATE TABLE IF NOT EXISTS production_batch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_code TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    produced_by TEXT,
    production_line TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY(product_id) REFERENCES product(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_part_number ON product(part_number);
CREATE INDEX IF NOT EXISTS idx_batch_product_id ON production_batch(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_code ON production_batch(batch_code);
CREATE INDEX IF NOT EXISTS idx_batch_created_at ON production_batch(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_search ON production_batch(batch_code, product_id);

-- Sample Data (optional, for testing)
-- INSERT INTO product (part_number, product_type, description) 
-- VALUES ('AB001', 'AF', 'Test Product AF');
-- INSERT INTO product (part_number, product_type, description) 
-- VALUES ('XY002', 'AOS', 'Test Product AOS');
