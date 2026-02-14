import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, production_batches, products, eq, like, desc, or } from '@/lib/db';
import { generateBatchCode } from '@/lib/batch-code';

export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    const allBatches = await db
      .select({
        id: production_batches.id,
        batch_code: production_batches.batch_code,
        product_id: production_batches.product_id,
        quantity: production_batches.quantity,
        produced_by: production_batches.produced_by,
        production_line: production_batches.production_line,
        remarks: production_batches.remarks,
        created_at: production_batches.created_at,
        updated_at: production_batches.updated_at,
        part_number: products.part_number,
        product_type: products.product_type,
        description: products.description,
      })
      .from(production_batches)
      .leftJoin(products, eq(production_batches.product_id, products.id))
      .orderBy(desc(production_batches.created_at));

    return NextResponse.json(allBatches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch batches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    const body = await req.json();
    const { batch_code, product_id, quantity, produced_by, production_line, remarks } = body;

    // Validation
    if (!batch_code || !product_id || !quantity) {
      return NextResponse.json(
        { error: 'batch_code, product_id and quantity are required' },
        { status: 400 }
      );
    }

    const qty = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Get product to verify it exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, product_id));

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if batch code already exists
    const existingBatch = await db
      .select()
      .from(production_batches)
      .where(eq(production_batches.batch_code, batch_code));

    if (existingBatch.length > 0) {
      return NextResponse.json(
        { error: 'Batch code already exists' },
        { status: 409 }
      );
    }

    // Insert batch
    const result = await db
      .insert(production_batches)
      .values({
        batch_code,
        product_id,
        quantity: qty,
        produced_by: produced_by || null,
        production_line: production_line || null,
        remarks: remarks || null,
        created_at: new Date(),
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Import operators
import { and } from 'drizzle-orm';
