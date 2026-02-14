-- Example data for testing
-- Run with: wrangler d1 execute production_tracking --file=sample-data.sql --local

INSERT INTO product (part_number, product_type, description) VALUES
('AB001', 'AF', 'Aluminum Frame Assembly 1'),
('AB002', 'AF', 'Aluminum Frame Assembly 2'),
('XY100', 'AOS', 'Optical Sensor Module'),
('XY101', 'AOS', 'Optical Sensor Module - Upgraded'),
('PT500', 'AF', 'Precision Tool Component'),
('PT501', 'AF', 'Precision Tool Component - v2');

-- Insert sample batches (populate after products exist)
INSERT INTO production_batch (batch_code, product_id, quantity, produced_by, production_line, remarks) VALUES
('AB001-20260215-001', 1, 150, 'John Smith', 'Line A', 'Standard production'),
('AB001-20260215-002', 1, 200, 'Sarah Johnson', 'Line B', 'Expedited order'),
('AB002-20260215-001', 2, 75, 'John Smith', 'Line A', null),
('XY100-20260215-001', 3, 500, 'Mike Chen', 'Line C', 'Batch run for inventory'),
('PT500-20260214-005', 5, 25, 'Sarah Johnson', 'Line A', 'Small batch, custom order'),
('PT501-20260214-001', 6, 100, 'John Smith', 'Line B', null);
