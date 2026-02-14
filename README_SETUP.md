# Production Tracking System

A simple, fast web app for logging production batches in manufacturing. Built on Cloudflare stack (Workers + D1) with a responsive Next.js frontend.

## Features

### Product Management
- ✅ Add new products with part number, product type (AF/AOS), and description
- ✅ List all products with filtering
- ✅ Automatic duplicate prevention for part numbers
- ✅ Search capabilities

### Production Batch Logging
- ✅ Select existing product from dropdown
- ✅ Log batch quantity, producer, production line
- ✅ Add optional remarks
- ✅ Automatic batch code generation: `PARTNUM-YYYYMMDD-SEQ`
- ✅ View all batches sorted by newest first
- ✅ Search batches by code or part number
- ✅ Fast, optimized factory floor UI

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Cloudflare Workers (Node.js compatible)
- **Database**: Cloudflare D1 (SQLite)
- **Runtime**: Edge (Cloudflare) or Local Development

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   │   ├── products/route.ts # Product endpoints
│   │   └── batches/route.ts  # Batch endpoints
│   ├── products/
│   │   ├── page.tsx         # Product list
│   │   └── add/page.tsx     # Add product form
│   ├── batches/
│   │   ├── page.tsx         # Batch list
│   │   └── add/page.tsx     # Add batch form
│   ├── layout.tsx           # Root layout with nav
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── form.tsx             # Form components
│   └── ui.tsx               # UI components
├── lib/
│   ├── db.ts                # Database schema & queries
│   ├── batch-code.ts        # Batch code generation
│   └── validation.ts        # Form validation
└── index.ts                 # Cloudflare Worker entry point
```

## Database Schema

### Products Table
```sql
CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_number TEXT UNIQUE NOT NULL,
    product_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Production Batches Table
```sql
CREATE TABLE production_batch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_code TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    produced_by TEXT,
    production_line TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY(product_id) REFERENCES product(id)
);
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
  ```json
  {
    "part_number": "AB123",
    "product_type": "AF",
    "description": "Optional description"
  }
  ```

### Batches
- `GET /api/batches` - List all batches (sorted newest first)
- `GET /api/batches?search=AB123` - Search batches by code or part number
- `POST /api/batches` - Create new batch
  ```json
  {
    "product_id": 1,
    "quantity": 100,
    "produced_by": "John Smith",
    "production_line": "Line A",
    "remarks": "Optional notes"
  }
  ```

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI (for D1 database): `npm install -g @cloudflare/wrangler`

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure D1 Database** (local development)
   ```bash
   # Create local D1 database
   wrangler d1 create production_tracking --local
   
   # Initialize schema
   wrangler d1 execute production_tracking --local < schema.sql
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser.

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## Deployment to Cloudflare

### 1. Setup Cloudflare Account
- Create account at cloudflare.com
- Install Wrangler: `npm install -g @cloudflare/wrangler`
- Authenticate: `wrangler login`

### 2. Create D1 Database
```bash
# Create production database
wrangler d1 create production_tracking

# Note the database_id from output
```

### 3. Update wrangler.toml
Replace database IDs with your actual IDs from step 2.

### 4. Initialize Database Schema
```bash
# Run SQL schema initialization
wrangler d1 execute production_tracking < schema.sql
```

### 5. Deploy
```bash
# Deploy Worker + Database
wrangler publish

# Or use: npm run deploy (if configured in package.json)
```

### 6. Configure Environment
Update `wrangler.toml` with your actual Cloudflare account ID and database IDs.

## Batch Code Generation

Batch codes are automatically generated in the format: `PARTNUM-YYYYMMDD-SEQ`

Example: `AB123-20260215-001`

- `PARTNUM`: Product part number (e.g., AB123)
- `YYYYMMDD`: Current date (e.g., 20260215)
- `SEQ`: Sequential number for that product on that day (001, 002, etc.)

The sequence resets daily and is per-product basis.

## Validation Rules

### Products
- Part number: Required, 2+ characters, must be unique
- Product type: Required, must be "AF" or "AOS"
- Description: Optional, max 500 characters

### Batches
- Product: Required, must exist in database
- Quantity: Required, must be positive integer
- Producer: Optional, free text
- Production line: Optional, free text
- Remarks: Optional, max 500 characters

## Performance Considerations

- **Fast data entry**: Minimal form fields, quick submission
- **Optimized queries**: Indexed part numbers and batch codes
- **Edge deployment**: Cloudflare Workers provide global low-latency access
- **Database**: D1 provides strong consistency with ACID guarantees

## What's NOT Included

As per requirements, this does NOT include:
- ❌ Authentication/authorization
- ❌ BOM (Bill of Materials) tracking
- ❌ Inventory deduction
- ❌ Label printing integration
- ❌ Analytics dashboards
- ❌ ERP functionality

This is intentional to keep the system simple and focused on the core use case.

## Future Enhancements

When needed, consider adding:
- User authentication (Cloudflare Access)
- Batch editing/deletion
- Production reports and analytics
- Label/barcode generation
- Mobile app (React Native)
- Real-time batch notifications

## Development Notes

### Database Queries
All database access uses prepared statements to prevent SQL injection.

### Error Handling
- API errors include descriptive messages
- Form validation happens client-side and server-side
- Database errors are logged but don't expose internals

### Component Architecture
- **Form Components**: Reusable, accessible form elements
- **UI Components**: Card, Table, Alert for consistent design
- **Validation**: Centralized validation logic in `lib/validation.ts`
- **Database**: Query builders in `lib/db.ts` for type-safe queries

## Troubleshooting

### D1 Connection Issues
```bash
# Test D1 connection locally
wrangler d1 execute production_tracking --local "SELECT 1"
```

### Database Schema Not Initialized
```bash
# Manually run schema initialization
wrangler d1 execute production_tracking --file=schema.sql --local
```

### Port Already in Use
```bash
# Run on different port
npm run dev -- -p 3001
```

## License

Proprietary - Kenrax Manufacturing

## Support

For issues or questions:
1. Check logs: `wrangler tail` (for deployed Workers)
2. Review database: `wrangler d1 shell production_tracking`
3. Check Next.js console output for client-side errors
