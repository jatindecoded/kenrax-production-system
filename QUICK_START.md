# Quick Start Guide

Get up and running with the Production Tracking System in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Text editor (VS Code recommended)

## 1. Install Dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind CSS, and dev tools.

## 2. Set Up Database (First Time Only)

For local development, you'll use SQLite via Wrangler:

```bash
# Install Wrangler globally
npm install -g @cloudflare/wrangler

# Create local D1 database
wrangler d1 create production_tracking --local

# Initialize schema
wrangler d1 execute production_tracking --local < schema.sql

# (Optional) Load sample data
wrangler d1 execute production_tracking --local < sample-data.sql
```

## 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see:
- Navigation bar with Home, Products, Batches links
- Welcome dashboard with quick start guide

## 4. Create Your First Product

1. Click **Products** in navigation
2. Click **+ Add Product** button
3. Fill in the form:
   - Part Number: `AB123` (example)
   - Product Type: Select `AF` or `AOS` (radio buttons)
   - Description: `Sample product for testing` (optional)
4. Click **Create Product**
5. You should see success message and redirect to products list

## 5. Log Your First Batch

1. Click **Batches** in navigation
2. Click **+ Log Batch** button
3. Fill in the form:
   - Product: Select the product you just created
   - Quantity: `100`
   - Produced By: `Your Name` (optional)
   - Production Line: `Line A` (optional)
   - Remarks: `Test batch` (optional)
4. Click **Create Batch**
5. You should see success message and batch appears in list

**Note**: Batch code is automatically generated as: `AB123-20260215-001`
(Your part number, today's date, sequence number)

## 6. Search Batches

1. On Batches page, type in search box:
   - `AB123` → shows batches with this part number
   - `20260215` → shows batches from this date
   - `Line A` → finds batches from that line
2. Click **Search** or press Enter
3. Results appear below, sorted newest first

## Common Tasks

### Add Another Product
1. Click **Products** → **+ Add Product**
2. Use unique part numbers (duplicates are rejected)
3. Choose AF or AOS type
4. Submit

### Log Batch from New Product
1. Click **Batches** → **+ Log Batch**
2. Product dropdown shows all created products
3. Select product
4. Enter quantity and optional details
5. Batch code auto-generates in format: `PARTNUM-YYYYMMDD-SEQ`

### View All Data
1. **Products page**: Lists all products in table format
2. **Batches page**: Shows latest batches, newest first
3. Links to add new items on each page

## What Gets Saved

### Products
- Part Number (unique)
- Product Type (AF or AOS)
- Description
- Created Date

### Batches
- Batch Code (auto-generated)
- Product (linked to product table)
- Quantity
- Produced By (who made it)
- Production Line (which line)
- Remarks (notes)
- Created Date

## Stopping the Server

Press `Ctrl+C` in the terminal.

## Restarting Dev Server

```bash
npm run dev
```

Database stays persistent locally.

## Building for Production

```bash
npm run build
npm run start
```

This creates optimized production bundle.

## Deploying to Cloudflare

See `README_SETUP.md` under "Deployment to Cloudflare" section.

## Database Access

### View Database (Local)
```bash
wrangler d1 shell production_tracking --local
```

Then you can run SQL queries:
```sql
SELECT * FROM product;
SELECT * FROM production_batch;
SELECT COUNT(*) FROM product;
```

### Reset Database (Warning: Deletes All Data)
```bash
# Delete local database
rm -rf .wrangler/state/

# Recreate and initialize
wrangler d1 create production_tracking --local
wrangler d1 execute production_tracking --local < schema.sql
```

## Keyboard Shortcuts

### In Forms
- `Tab`: Move between fields
- `Shift+Tab`: Move to previous field
- `Enter`: Submit form
- `Escape`: Cancel (if implemented)

### On Lists
- No keyboard shortcuts currently (can be added)

## Tips for Fast Data Entry

1. **On Batches page**: Use tab to quickly move between fields
2. **Products**: Create batches of products at once before logging
3. **Search**: Works real-time, start typing to find batches
4. **Quantity**: Always positive integers only
5. **Part Numbers**: Keep them short (2-8 chars) for easier typing

## Troubleshooting

### Database Error on First Run
```
Error: "Database not configured"
```
**Solution**: Run `wrangler d1 create production_tracking --local` and `wrangler d1 execute production_tracking --local < schema.sql`

### Products don't load
1. Check that products exist: `wrangler d1 shell production_tracking --local`
2. Run: `SELECT COUNT(*) FROM product;`
3. If empty, create a product via the web form

### Batch code not generating
1. Batch code is generated server-side automatically
2. Check browser console (F12) for errors
3. Verify product was selected in dropdown

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Next Steps

After getting comfortable with basic data entry:

1. **Create realistic products** with your actual part numbers
2. **Log batches** throughout a typical day
3. **Search and review** past batches
4. **Request features** like batch editing or reports
5. **Plan deployment** to Cloudflare when ready

## Support

Check these files for more info:
- `README_SETUP.md` - Full setup and deployment guide
- `IMPLEMENTATION_GUIDE.md` - Technical architecture details
- Source code in `src/` folders with detailed comments

Good luck with your production tracking! 🚀
