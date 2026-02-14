# Production Tracking System - File Reference

Complete reference of all files created and their purposes.

## 📂 Core Application Files

### Configuration
- **`package.json`** - Dependencies and scripts (Next.js, React, TypeScript, Tailwind)
- **`tsconfig.json`** - TypeScript configuration
- **`next.config.ts`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`postcss.config.mjs`** - PostCSS configuration
- **`eslint.config.mjs`** - ESLint configuration
- **`wrangler.toml`** - Cloudflare Workers configuration

## 🗄️ Database

### Schema & Data
- **`schema.sql`** - Main database schema (tables, indexes, constraints)
- **`sample-data.sql`** - Optional test data for development

### Database Layer (`src/lib/`)
- **`db.ts`** - Database schema definition, type interfaces, query builders
  - Exports: `Product`, `ProductionBatch`, `BatchWithProduct` interfaces
  - Exports: `productQueries`, `batchQueries` objects with prepared statements
  - Exports: `schemaSQL` for database initialization

## 🔄 Utilities (`src/lib/`)

- **`batch-code.ts`** - Batch code generation and parsing
  - `generateBatchCode(partNumber, lastSequence)` - Creates PARTNUM-YYYYMMDD-SEQ
  - `parseBatchCode(code)` - Extracts components from batch code
  - `ParsedBatchCode` interface

- **`validation.ts`** - Form validation logic
  - `validateProduct()` - Validates product form data
  - `validateBatch()` - Validates batch form data
  - `getFieldError()` - Helper for accessing field-specific errors
  - `ValidationResult` and `ValidationError` interfaces

## 🎨 Components (`src/components/`)

### Form Components (`form.tsx`)
- `FormError` - Displays validation error messages
- `FormGroup` - Wrapper div for form sections
- `FormLabel` - Label with required indicator
- `FormInput` - Text input with error styling
- `FormTextarea` - Multi-line text area
- `FormSelect` - Dropdown/select element
- `FormRadioGroup` - Radio button group (used for AF/AOS)
- `Button` - Clickable button (primary/secondary/danger variants)

### UI Components (`ui.tsx`)
- `Card/CardHeader/CardContent/CardFooter` - Consistent card layout
- `Alert` - Alert message box (success/error/info/warning)
- `Table/TableHeader/TableBody/TableRow/TableCell` - Data table components

## 📄 Pages

### Root
- **`src/app/layout.tsx`** - Root layout with navigation bar and footer
  - Navigation links: Home, Products, Batches
  - Global styles wrapper
  - Footer with tech stack info

- **`src/app/page.tsx`** - Home dashboard
  - Quick start cards (Products, Batches)
  - Feature highlights
  - Getting started guide

### Products
- **`src/app/products/page.tsx`** - Product list
  - Table view of all products
  - Shows: part_number, type, description, created_at
  - Link to add new product
  - Empty state with helpful message

- **`src/app/products/add/page.tsx`** - Add product form
  - Form fields: part_number (text), product_type (radio: AF/AOS), description (textarea)
  - Client-side validation via `validateProduct()`
  - Success message and redirect
  - Error handling for duplicates

### Batches
- **`src/app/batches/page.tsx`** - Batch list and search
  - Table view of all batches (newest first)
  - Shows: batch_code, part_number, type, qty, produced_by, production_line, date
  - Search functionality (batch_code or part_number)
  - Empty state handling
  - Loading state

- **`src/app/batches/add/page.tsx`** - Log batch form
  - Fetches products for dropdown
  - Form fields: product (select), quantity (number), produced_by, production_line, remarks
  - Client-side validation via `validateBatch()`
  - Server-side batch code generation
  - Success message and redirect
  - Helpful message if no products exist

### Styling
- **`src/app/globals.css`** - Global CSS (Tailwind imports, base styles)

## ⚙️ API Routes (`src/app/api/`)

### Products API
- **`src/app/api/products/route.ts`** - Product endpoints
  - `POST /api/products` - Create product
    - Validates part_number, product_type
    - Returns 201 on success, 409 on duplicate, 400 on validation error
  - `GET /api/products` - List all products
    - Returns array of Product objects

### Batches API
- **`src/app/api/batches/route.ts`** - Batch endpoints
  - `POST /api/batches` - Create batch
    - Validates product exists, quantity is positive
    - Automatically generates batch_code
    - Calculates next sequence number for the day
    - Returns 201 with batch data
  - `GET /api/batches` - List batches
    - Optional query parameter: `?search=...`
    - Searches batch_code and part_number
    - Returns array of BatchWithProduct objects (joins product data)

## 🚀 Cloudflare Worker

- **`src/index.ts`** - Cloudflare Workers entry point
  - Alternative to Next.js API routes for edge deployment
  - Uses itty-router for routing
  - Implements same endpoints as Next.js routes
  - Includes database initialization logic
  - Ready to deploy with: `wrangler publish`

## 📖 Documentation

### Getting Started
- **`QUICK_START.md`** ⭐ **START HERE**
  - 5-minute setup guide
  - Step-by-step walkthrough
  - Common tasks
  - Troubleshooting tips

### Complete Guides
- **`README_SETUP.md`** - Full setup and deployment guide
  - Feature overview
  - Installation steps
  - Local development
  - Cloudflare deployment
  - API reference
  - Database details
  - Future enhancements

- **`IMPLEMENTATION_GUIDE.md`** - Technical architecture
  - System overview diagram
  - Component descriptions
  - API design patterns
  - Database access patterns
  - Data flow examples
  - Performance analysis
  - Security considerations
  - Testing strategy

- **`PROJECT_SUMMARY.md`** - High-level overview
  - What's included/excluded
  - Quick start
  - Technology stack
  - File structure
  - Next steps

- **`FILE_REFERENCE.md`** (this file)
  - Detailed file listing
  - Purpose of each file
  - Quick navigation

## 📊 File Statistics

```
Total Files: ~25
TypeScript/TSX: 15
SQL: 2
Configuration: 6
Documentation: 4
JSON/TOML: 2
CSS: 1
```

## 🔗 Dependencies

### Runtime
- `next@16.1.6` - React framework
- `react@19.2.3` - UI library
- `react-dom@19.2.3` - DOM utilities

### Build/Dev
- `typescript@^5` - Type checking
- `tailwindcss@^4` - CSS framework
- `eslint@^9` - Linting
- `@tailwindcss/postcss@^4` - Tailwind CSS plugin
- `@types/node@^20` - Node.js types
- `@types/react@^19` - React types
- `@types/react-dom@^19` - React DOM types

## 🎯 Quick File Navigation

### I want to...

**...add a new product type (beyond AF/AOS)**
→ Edit: `src/lib/validation.ts` (validateProduct), `src/lib/db.ts` (CHECK constraint)

**...change batch code format**
→ Edit: `src/lib/batch-code.ts` (generateBatchCode function)

**...add a new product field**
→ Edit: `schema.sql`, `src/lib/db.ts`, `src/app/products/add/page.tsx`

**...add batch editing**
→ Create: `src/app/api/batches/[id]/route.ts`, `src/app/batches/[id]/edit/page.tsx`

**...change styling**
→ Edit: `tailwind.config.ts`, component files (className props), `src/app/globals.css`

**...add authentication**
→ Add Cloudflare Access integration, modify layout.tsx to check auth

**...deploy to Cloudflare**
→ Follow: `README_SETUP.md` → Deployment section

**...understand the data flow**
→ Read: `IMPLEMENTATION_GUIDE.md` → Data Flow Examples

**...get started quickly**
→ Read: `QUICK_START.md`

## 📝 Code Organization Principles

1. **Type Safety**: All files use TypeScript for compile-time checking
2. **DRY (Don't Repeat Yourself)**: Reusable components and utilities
3. **Single Responsibility**: Each file/function has one clear purpose
4. **Prepared Statements**: All database queries use parameter binding
5. **Error Handling**: Comprehensive error messages without exposing internals
6. **Validation**: Client-side (UX) + server-side (security)
7. **Documentation**: Comments for complex logic, clear variable names
8. **Modular**: Independent, testable components

## 🔒 Security Checklist

✅ SQL injection prevention (prepared statements)
✅ Input validation (client + server)
✅ Database constraints (UNIQUE, CHECK, FOREIGN KEY)
✅ Error messages don't expose internals
✅ TypeScript prevents type-related bugs
✅ No hardcoded secrets
✅ CORS handled by Workers/Cloudflare

⚠️ TODO (future):
- [ ] Add authentication
- [ ] Add rate limiting
- [ ] Add request size limits
- [ ] Add CSRF protection (if needed)

## 🚀 Deployment Files

- **`wrangler.toml`** - Cloudflare Workers + D1 configuration
- **`src/index.ts`** - Cloudflare Workers handler
- **`schema.sql`** - D1 database schema

To deploy:
```bash
wrangler d1 create production_tracking
# Update wrangler.toml with database ID
wrangler d1 execute production_tracking < schema.sql
wrangler publish
```

---

This file structure is designed for:
- ✅ Easy navigation
- ✅ Clear separation of concerns
- ✅ Simple deployment
- ✅ Team collaboration
- ✅ Future growth

Last updated: February 2026
