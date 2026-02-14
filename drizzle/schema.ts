import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';

// Products table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  part_number: text('part_number').notNull().unique(),
  product_type: text('product_type', { enum: ['AIR_FILTER', 'OIL_FILTER', 'AIR_OIL_SEPARATOR'] }).notNull(),
  description: text('description'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Production Batches table
export const production_batches = sqliteTable(
  'production_batches',
  {
    id: integer('id').primaryKey(),
    batch_code: text('batch_code').notNull().unique(),
    product_id: integer('product_id').notNull(),
    quantity: integer('quantity').notNull(),
    produced_by: text('produced_by'),
    production_line: text('production_line'),
    remarks: text('remarks'),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [products.id],
    }),
  ],
);

// Type exports
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductionBatch = typeof production_batches.$inferSelect;
export type NewProductionBatch = typeof production_batches.$inferInsert;
