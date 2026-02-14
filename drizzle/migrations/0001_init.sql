CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_number TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS production_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_code TEXT UNIQUE NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  produced_by TEXT,
  production_line TEXT,
  remarks TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_product_part_number ON products(part_number);
CREATE INDEX IF NOT EXISTS idx_batch_product_id ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_code ON production_batches(batch_code);
