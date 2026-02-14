# Implementation Guide

A complete walkthrough of the Production Tracking System architecture and key implementation details.

## System Overview

```
┌─────────────────┐
│   Browser       │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────────────────┐
│   Cloudflare Workers        │
│  (Next.js API Routes/Edge)  │
│  - GET/POST /api/products   │
│  - GET/POST /api/batches    │
└────────┬─────────────────────┘
         │
         │ SQL Queries
         │
┌────────▼────────────────────┐
│   Cloudflare D1 Database    │
│   (SQLite on Edge)          │
│  - product table            │
│  - production_batch table   │
└─────────────────────────────┘
```

## Core Components

### 1. Database Layer (`src/lib/db.ts`)

**Purpose**: Type-safe database access with prepared statements.

**Key Exports**:
- `Product` interface: Product data model
- `ProductionBatch` interface: Batch data model
- `productQueries`: Query builders for product operations
- `batchQueries`: Query builders for batch operations
- `schemaSQL`: Full database schema

**Example Usage**:
```typescript
const query = productQueries.createProduct('AB123', 'AF', 'Description');
const result = await db.prepare(query.sql).bind(...query.bindings).run();
```

**Design Pattern**: Query builders return `{sql, bindings}` objects to prevent SQL injection.

### 2. Batch Code Generator (`src/lib/batch-code.ts`)

**Purpose**: Generate and parse unique batch codes.

**Format**: `PARTNUM-YYYYMMDD-SEQ`
- PARTNUM: Product part number (e.g., AB123)
- YYYYMMDD: Current date (e.g., 20260215 for Feb 15, 2026)
- SEQ: Sequential number (001, 002, etc.) - resets daily per product

**Key Functions**:
```typescript
// Generate batch code
const code = generateBatchCode('AB123', 5); // Returns: AB123-20260215-006

// Parse batch code
const parsed = parseBatchCode('AB123-20260215-006');
// Returns: {partNumber: 'AB123', date: Date(...), sequence: 6}
```

**Sequence Logic**:
```typescript
// In batch creation API:
1. Get today's date in YYYYMMDD format
2. Query max(SEQ) for product_id where batch_code LIKE '%YYYYMMDD%'
3. Increment and generate new batch code
```

### 3. Validation Layer (`src/lib/validation.ts`)

**Purpose**: Client and server-side form validation.

**Validators**:
- `validateProduct()`: Checks part_number, product_type, description
- `validateBatch()`: Checks product_id, quantity, optional fields
- `getFieldError()`: Helper to get specific field error

**Returns**:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

**Usage**:
```typescript
const validation = validateProduct({part_number: '', product_type: 'AF'});
if (!validation.isValid) {
  // validation.errors[0] = {field: 'part_number', message: 'Part number is required'}
}
```

## API Routes

### Product API (`src/app/api/products/route.ts`)

**POST /api/products**
- Creates new product
- Validates part_number uniqueness
- Returns 201 with product data or 409 on duplicate
- Returns 400 on validation error

**GET /api/products**
- Lists all products sorted by creation date (newest first)
- Returns array of Product objects
- No pagination (intentional for small datasets)

**Error Handling**:
```typescript
// Duplicate part number
409 Conflict: {error: 'Part number already exists'}

// Missing fields
400 Bad Request: {error: 'part_number and product_type are required'}

// Database error
500 Internal Server Error: {error: 'Failed to create product'}
```

### Batch API (`src/app/api/batches/route.ts`)

**POST /api/batches**
- Creates new production batch
- Validates product exists
- Generates batch code automatically
- Calculates next sequence number
- Returns 201 with batch data

**GET /api/batches**
- Lists all batches sorted by creation date (newest first)
- Optional search parameter: `?search=AB123`
- Searches batch_code and product part_number
- Returns array of BatchWithProduct objects

**Sequence Number Logic**:
```sql
-- Query to get last sequence for today
SELECT COALESCE(MAX(CAST(SUBSTR(batch_code, -3) AS INTEGER)), 0) as max_seq
FROM production_batch
WHERE product_id = ? AND batch_code LIKE ?
-- Extracts last 3 chars (SEQ) and finds max, defaulting to 0
```

## Frontend Components

### Form Components (`src/components/form.tsx`)

Reusable form elements with consistent styling:
- `FormError`: Display validation errors
- `FormLabel`: Accessible label with required indicator
- `FormInput`: Text input with error styling
- `FormTextarea`: Multi-line text with error styling
- `FormSelect`: Dropdown with error styling
- `FormRadioGroup`: Radio buttons (used for product_type)
- `Button`: Button with variants (primary/secondary/danger)

**Styling**: Tailwind CSS with focus states and accessibility.

### UI Components (`src/components/ui.tsx`)

Layout and display components:
- `Card/CardHeader/CardContent/CardFooter`: Consistent card design
- `Alert`: Success/error/info/warning messages
- `Table/TableHeader/TableBody/TableRow/TableCell`: Data tables with hover states

## Pages

### Product Pages

**`/products`** - Product List
- Fetches all products on mount
- Displays in table format
- Shows part_number, type, description, created_at
- Link to add new product

**`/products/add`** - Add Product
- Form with part_number, product_type (radio), description
- Client-side validation via validateProduct()
- POST to /api/products
- Redirects to /products on success
- Shows error alerts on failure

### Batch Pages

**`/batches`** - Batch List
- Fetches all batches on mount
- Search by batch_code or part_number
- Displays table with batch_code, part_number, type, qty, produced_by, production_line, date
- Sorted newest first (handled in API)
- Link to log new batch

**`/batches/add`** - Log Batch
- Fetches products for dropdown on mount
- Form with product select, quantity, produced_by, production_line, remarks
- Client-side validation via validateBatch()
- POST to /api/batches
- Batch code generated server-side automatically
- Redirects to /batches on success

### Home Page

**`/`** - Dashboard
- Quick start guide
- Links to main features
- Feature highlights

### Layout

**`/app/layout.tsx`**
- Global navigation bar
- Links to Home, Products, Batches
- Footer with technology stack info
- Responsive design

## Database Access Patterns

### Prepared Statements

All queries use prepared statements with parameter binding:

```typescript
// ❌ NEVER do this:
const query = `SELECT * FROM product WHERE id = ${id}`;

// ✅ ALWAYS do this:
const query = {
  sql: `SELECT * FROM product WHERE id = ?`,
  bindings: [id]
};
await db.prepare(query.sql).bind(...query.bindings).run();
```

### Query Builders

Centralized in `db.ts` to maintain consistency:

```typescript
// In db.ts
export const productQueries = {
  createProduct: (partNumber, productType, description) => ({
    sql: `INSERT INTO product (...) VALUES (?, ?, ?)`,
    bindings: [partNumber, productType, description || null]
  }),
  getAllProducts: () => ({
    sql: `SELECT * FROM product ORDER BY created_at DESC`,
    bindings: []
  })
};

// In API route
const query = productQueries.createProduct('AB123', 'AF', 'desc');
await db.prepare(query.sql).bind(...query.bindings).run();
```

### Index Strategy

Indexes created for common queries:

```sql
-- Unique constraint on part_number (UNIQUE INDEX)
CREATE UNIQUE INDEX idx_product_part_number ON product(part_number);

-- Foreign key lookups
CREATE INDEX idx_batch_product_id ON production_batch(product_id);

-- Search by batch code
CREATE INDEX idx_batch_code ON production_batch(batch_code);

-- Sort operations (newest first)
CREATE INDEX idx_batch_created_at ON production_batch(created_at DESC);
```

## Error Handling Strategy

### Validation Errors (400)
```json
{
  "error": "quantity must be a positive number",
  "field": "quantity"
}
```

### Not Found Errors (404)
```json
{
  "error": "Product not found"
}
```

### Conflict Errors (409)
```json
{
  "error": "Part number already exists"
}
```

### Server Errors (500)
```json
{
  "error": "Failed to create product"
}
```

**Note**: Server errors don't expose internal details (no stack traces).

## Data Flow Examples

### Creating a Product

```
1. User fills form: part_number="AB123", product_type="AF", description="Test"
2. Client validates: validateProduct({...})
   - Checks part_number not empty and 2+ chars ✓
   - Checks product_type is AF or AOS ✓
3. Client POSTs to /api/products with JSON payload
4. Server validates again (defense in depth)
5. Server inserts into database with prepared statement
6. Server returns 201 with product data
7. Client redirects to /products
8. User sees new product in list
```

### Creating a Batch

```
1. User selects product from dropdown (loaded from API on page load)
2. User enters quantity: 150
3. User optionally enters produced_by, production_line, remarks
4. Client validates: validateBatch({...})
   - Checks product_id selected ✓
   - Checks quantity is positive integer ✓
5. Client POSTs to /api/batches
6. Server validates product exists
7. Server queries last sequence for today:
   SELECT MAX(SUBSTR(batch_code, -3)) FROM production_batch 
   WHERE product_id=1 AND batch_code LIKE '%20260215%'
   → Returns 0 (first batch of the day)
8. Server generates batch_code: AB123-20260215-001
9. Server inserts batch into database
10. Server returns 201 with batch_code
11. Client shows success message
12. Client redirects to /batches
13. User sees new batch in list with generated code
```

### Searching Batches

```
1. User types "AB123" in search box
2. Client sends GET /api/batches?search=AB123
3. Server uses batchQueries.searchBatches('AB123')
4. Server executes:
   SELECT * FROM production_batch pb
   LEFT JOIN product p ON pb.product_id = p.id
   WHERE pb.batch_code LIKE '%AB123%' OR p.part_number LIKE '%AB123%'
   ORDER BY pb.created_at DESC
5. Server returns matching batches
6. Client displays in table
7. Batches from batch_code OR part_number match are included
```

## Performance Characteristics

### Query Performance

| Operation | Query | Indexes Used | Notes |
|-----------|-------|--------------|-------|
| Get all products | SELECT * ORDER BY created_at DESC | created_at | O(n) |
| Search products | WHERE part_number LIKE ? | part_number | O(log n) |
| Create product | INSERT | UNIQUE constraint | Validates uniqueness |
| Get all batches | SELECT * ORDER BY created_at DESC | created_at | O(n) |
| Search batches | WHERE batch_code OR part_number LIKE ? | batch_code, product_id | O(log n) |
| Get next seq | MAX(SUBSTR(...)) WHERE product_id AND LIKE | product_id + batch_code | O(log n) |

### Expected Scalability

- **1K products**: Negligible impact
- **100K batches**: No problem with indexes
- **1M batches**: May need pagination (not in MVP)
- **Index strategy**: Maintains sub-100ms queries for expected volumes

## Security Considerations

### SQL Injection Prevention
✅ All queries use prepared statements with parameter binding
✅ Query builders in `db.ts` enforce this pattern

### Input Validation
✅ Client-side validation for UX
✅ Server-side validation for security
✅ Database constraints (UNIQUE, CHECK, FOREIGN KEY)

### XSS Prevention
✅ React auto-escapes content by default
✅ No dangerous HTML parsing

### CSRF Protection
⚠️ Not implemented (single-origin assumption)
- Add when deployed if receiving cross-origin requests

### What's NOT Protected
❌ No authentication/authorization (noted as future work)
❌ No rate limiting (add when deploying)
❌ No request size limits (add in Workers middleware)

## Deployment Considerations

### Cloudflare Workers
- Edge location for low latency
- Unlimited scale on D1 (within plan limits)
- Automatic SSL/TLS
- DDoS protection built-in

### D1 Database
- Replicated for durability
- Point-in-time restore available
- Backed up automatically
- Strong consistency guarantees

### Environment Variables
Store in `wrangler.toml`:
```toml
[env.production]
d1_databases = [{binding = "DB", database_name = "production_tracking"}]
```

## Testing Strategy

### Manual Testing Checklist

```
Product Management:
[ ] Add product with all fields
[ ] Add product without description
[ ] Try duplicate part number → should fail
[ ] Verify product appears in list
[ ] Verify product type badge displays correct value

Batch Logging:
[ ] Log batch with all fields
[ ] Log batch without optional fields
[ ] Enter non-numeric quantity → should show error
[ ] Enter negative quantity → should show error
[ ] Verify batch code format (PARTNUM-YYYYMMDD-SEQ)
[ ] Verify sequence increments daily
[ ] Verify batch appears newest first

Search:
[ ] Search by batch code → should find batch
[ ] Search by part number → should find batch
[ ] Search non-existent value → should show empty list
[ ] Clear search → should show all batches

Navigation:
[ ] All navbar links work
[ ] Home page loads
[ ] Empty states show helpful messages
```

### Automated Testing

Would include:
- Validation unit tests in `lib/validation.ts`
- Batch code generation tests in `lib/batch-code.ts`
- API route tests (POST/GET products and batches)
- Component tests for form validation display
- E2E tests with Playwright/Cypress

## Future Enhancements

### Phase 2: Robustness
- Pagination for large batch lists (100+ batches)
- Batch editing and soft deletion
- Audit logging for all changes
- Data export (CSV)

### Phase 3: User Experience
- Batch printing labels with barcode
- Mobile-optimized touch interface
- Batch quick actions (edit, duplicate, delete)
- Keyboard shortcuts for fast entry

### Phase 4: Integration
- Authentication with Cloudflare Access
- User roles (operator, supervisor, manager)
- Real-time notifications on batch completion
- Integration with warehouse system

### Phase 5: Intelligence
- Production reports and analytics
- KPI dashboards (daily production, defect rates)
- Anomaly detection (unusual batch sizes)
- Forecasting based on historical data

## Troubleshooting

### Common Issues

**Issue**: "Database not configured" error
```
Solution: Ensure wrangler.toml has D1 binding
[env.production]
d1_databases = [{binding = "DB", database_name = "production_tracking"}]
```

**Issue**: Batch sequence resets mid-day
```
Solution: Check date format in query. LIKE uses exact date string YYYYMMDD.
Verify: SELECT batch_code FROM production_batch LIMIT 10;
```

**Issue**: Search not finding batches
```
Solution: Check LIKE pattern. Empty search should show all batches.
Debug: SELECT COUNT(*) FROM production_batch; to verify data exists.
```

**Issue**: Part number still shows as duplicate after retry
```
Solution: Unique constraint is database-enforced. User must use different part number.
This is intentional to prevent data inconsistency.
```

