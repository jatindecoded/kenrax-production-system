import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, products, eq } from '@/lib/db';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);


    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    const body = await req.json();
    let { part_number, product_type, description } = body;

    // Convert part_number to uppercase
    part_number = part_number.toUpperCase();

    // Validation
    if (!part_number || !product_type) {
      return NextResponse.json(
        { error: 'part_number and product_type are required' },
        { status: 400 }
      );
    }

    if (!['AIR_FILTER', 'OIL_FILTER', 'AIR_OIL_SEPARATOR'].includes(product_type)) {
      return NextResponse.json(
        { error: 'product_type must be AIR_FILTER, OIL_FILTER, or AIR_OIL_SEPARATOR' },
        { status: 400 }
      );
    }

    // Check if part number already exists
    const existing = await db.select().from(products).where(eq(products.part_number, part_number));
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Part number already exists' },
        { status: 409 }
      );
    }

    // Insert new product
    const result = await db.insert(products).values({
      part_number,
      product_type: product_type as 'AIR_FILTER' | 'OIL_FILTER' | 'AIR_OIL_SEPARATOR',
      description: description || null,
      created_at: new Date(),
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
