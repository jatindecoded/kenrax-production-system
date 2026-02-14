import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../drizzle/schema';
import { eq, like, desc, and, or } from 'drizzle-orm';

// Export schema tables directly
export const { products, production_batches } = schema;

// Export Drizzle operators
export { eq, like, desc, and, or };

// Type exports
export type Product = typeof schema.products.$inferSelect;
export type NewProduct = typeof schema.products.$inferInsert;
export type ProductionBatch = typeof schema.production_batches.$inferSelect;
export type NewProductionBatch = typeof schema.production_batches.$inferInsert;

export interface BatchWithProduct extends ProductionBatch {
  part_number?: string;
  product_type?: 'AF' | 'AOS';
  description?: string | null;
}

// Get DB client from Cloudflare context
export function getDB(env: any) {
  return drizzle(env.DB, { schema });
}
