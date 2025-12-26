# Quick Start: Supabase Setup

## Setup Status

Your Supabase database is already configured and ready to use!

- Database schema has been applied via Supabase migrations
- Demo user accounts are created
- Philippine geographic data (regions, provinces, cities, barangays) is loaded
- System settings are configured

## Demo Accounts

The following test accounts are available:

- **Admin**: admin@lending.ph / Password123!
- **Processor**: processor@lending.ph / Password123!
- **Approver**: approver@lending.ph / Password123!

## Development Workflow

### 1. Generate Prisma Client

```bash
npm run schema:dev
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### 3. Build for Production

```bash
npm run build
```

---

## Database Management

### Viewing Data

You can view and manage your database through the Supabase dashboard:
https://supabase.com/dashboard

### Adding Test Data

The database currently has:
- 3 demo user accounts
- Philippine geographic data (regions, provinces, cities, barangays)
- System settings

To add loan applications and receipts for testing, use the application's UI after logging in.

---

## Switching Between Databases

This project supports dual schemas for development and production:

**Development (Supabase/PostgreSQL)**
```bash
npm run schema:dev
```

**Production (Azure SQL Server)**
```bash
npm run schema:prod
```

Note: The production database requires separate configuration in your .env file.

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run schema:dev` | Generate Prisma client for Supabase |
| `npm run schema:prod` | Generate Prisma client for Azure SQL |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

**Build Errors?**
```bash
npm run schema:dev
npm run build
```

**Type Errors?**
Make sure Prisma client is generated:
```bash
npm run schema:dev
```

**Database Connection Issues?**
- Verify DATABASE_URL in .env is correct
- Check Supabase project status in dashboard
- Ensure network connectivity to Supabase

---

For detailed architecture documentation, see **DUAL_SCHEMA_SETUP.md** and **README.md**
