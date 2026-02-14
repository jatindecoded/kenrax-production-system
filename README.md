# Kenrax Production Tracking System

A simple, fast web app for logging production batches in manufacturing. Built on Cloudflare Workers + D1 database + Next.js frontend.

## ✨ Features

- **Product Management**: Add products with part numbers, types (AF/AOS), descriptions
- **Batch Logging**: Log production with automatic batch code generation (PARTNUM-YYYYMMDD-SEQ)
- **Search & Sort**: Find batches by code or part number, sorted newest first
- **Fast & Simple**: Optimized for factory floor data entry, minimal fields
- **Cloud Ready**: Deployable to Cloudflare Workers with edge performance
- **Type Safe**: Full TypeScript, prepared statements, validation

## 🚀 Quick Start

**1 minute**: Get the basic structure running
```bash
npm install
wrangler d1 create production_tracking --local
wrangler d1 execute production_tracking --local < schema.sql
npm run dev
```

**5 minutes**: Follow the step-by-step guide in [QUICK_START.md](QUICK_START.md)

**15 minutes**: Read [README_SETUP.md](README_SETUP.md) for complete details

## 📋 Core Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Dashboard with quick links |
| Products | `/products` | List all products |
| Add Product | `/products/add` | Create new product (part #, type, description) |
| Batches | `/batches` | List & search production batches |
| Log Batch | `/batches/add` | Create batch (product, qty, producer, line, notes) |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Cloudflare Workers (Node.js compatible)
- **Database**: Cloudflare D1 (SQLite)
- **Validation**: Client-side and server-side
- **Security**: Prepared statements, input validation, database constraints

## 📊 Database

Two main tables:

**Products**
```
id (PK), part_number (UNIQUE), product_type (AF|AOS), description, created_at
```

**Production Batches**
```
id (PK), batch_code, product_id (FK), quantity, produced_by, production_line, remarks, created_at
```

## 🎯 What's NOT Included

- ❌ User authentication (noted for future)
- ❌ BOM tracking
- ❌ Inventory management
- ❌ Label printing
- ❌ Analytics dashboards
- ❌ ERP features

This keeps the system focused and simple.

## 📖 Documentation

1. **[QUICK_START.md](QUICK_START.md)** ⭐ **START HERE**
   - 5-minute setup
   - Basic usage
   - Troubleshooting

2. **[README_SETUP.md](README_SETUP.md)**
   - Complete feature reference
   - Detailed setup
   - API endpoints
   - Cloudflare deployment

3. **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)**
   - Technical architecture
   - Component details
   - Database design
   - Data flows
   - Security notes

4. **[FILE_REFERENCE.md](FILE_REFERENCE.md)**
   - File-by-file breakdown
   - Purpose of each file
   - Navigation guide

5. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
   - High-level overview
   - What's included
   - Getting started
   - Next steps

## 🌐 Deployment

### Local Development
```bash
npm run dev
# Runs on http://localhost:3000
# Uses local SQLite database
```

### Cloudflare
```bash
wrangler publish
# Deploys to Cloudflare Workers + D1
# See README_SETUP.md for full instructions
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (responsive design)

## 🔒 Security

✅ Prepared statements (SQL injection prevention)
✅ Input validation (client + server)
✅ Database constraints (UNIQUE, CHECK, FK)
✅ Error handling (no sensitive data exposed)
✅ TypeScript (compile-time type safety)

## 🧪 Testing

Manual testing checklist in [QUICK_START.md](QUICK_START.md)

Automated test examples:
- Validation functions (unit)
- API endpoints (integration)
- Components (component)
- E2E workflows (Playwright/Cypress)

## 📞 Support

**Setup help**: See [QUICK_START.md](QUICK_START.md) → Troubleshooting

**Technical questions**: See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

**File locations**: See [FILE_REFERENCE.md](FILE_REFERENCE.md)

## 📈 Next Steps

### Immediate
- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Run `npm install`
- [ ] Create local database
- [ ] Start dev server
- [ ] Test product & batch creation

### This Week
- [ ] Use with real part numbers
- [ ] Train team
- [ ] Gather feedback
- [ ] Deploy to staging

### This Month
- [ ] Deploy to Cloudflare
- [ ] Add batch export
- [ ] Add editing capabilities

## 📄 License

Proprietary - Kenrax Manufacturing

## 🎉 Ready?

**Start here**: [QUICK_START.md](QUICK_START.md)

---

Built with ❤️ for manufacturing efficiency
