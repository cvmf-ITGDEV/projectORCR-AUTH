# Dual Schema Setup Guide

This project uses a **dual-schema approach** to support both **PostgreSQL (Supabase)** for development and **Azure SQL Server** for production.

## Overview

### Why Dual Schema?

- **Development**: Use PostgreSQL (Supabase) - free, cloud-hosted, and easy to set up
- **Production**: Use Azure SQL Server - your existing production database
- **Zero Lock-in**: Switch between databases anytime using simple npm scripts
- **Prisma 7 Compatible**: Uses modern adapter pattern for database connections

### Schema Files

```
prisma/
├── schema.prisma          # Active schema (defaults to PostgreSQL)
├── schema.dev.prisma      # PostgreSQL/Supabase schema
└── schema.prod.prisma     # Azure SQL Server schema
```

### How It Works (Prisma 7)

This setup uses **Prisma 7's adapter pattern**:
- The schema files define the database provider (PostgreSQL or SQL Server)
- The database URL is passed through adapters in `src/lib/db.ts`
- The system automatically detects which database you're using based on the connection string
- No manual switching needed - just change the `DATABASE_URL` environment variable!

## Quick Start

### 1. Configure Environment Variables

Edit `.env` file and update the Supabase connection string:

```env
# Replace [YOUR-PASSWORD] with your actual Supabase database password
DATABASE_URL="postgresql://postgres.0ec90b57d6e95fcbda19832f:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**How to get your Supabase password:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (ID: 0ec90b57d6e95fcbda19832f)
3. Go to Settings → Database
4. Find your connection string or reset your password
5. Copy the connection string and replace `[YOUR-PASSWORD]` with the actual password

**Note**: The system automatically detects the database type from the connection string:
- PostgreSQL: `postgresql://...` or `postgres://...`
- SQL Server: `sqlserver://...`

### 2. Switch Between Schemas

Use these npm scripts to switch between development and production:

```bash
# Switch to PostgreSQL/Supabase (Development)
npm run schema:dev

# Switch to Azure SQL Server (Production)
npm run schema:prod
```

**What happens when you switch?**
- The appropriate schema file is copied to `schema.prisma`
- Prisma Client is regenerated with the correct types
- Your IDE will auto-detect the changes

## Database Operations

### Push Schema to Database

Push schema changes without creating migrations:

```bash
# Push to development (PostgreSQL/Supabase)
npm run db:push:dev

# Push to production (Azure SQL Server)
npm run db:push:prod
```

### Create and Run Migrations

For production-ready migration files:

```bash
# Development migrations
npm run db:migrate:dev

# Production migrations (deploy only)
npm run db:migrate:prod
```

### Seed the Database

Run the seed script after schema is applied:

```bash
npm run db:seed
```

## Development Workflow

### Daily Development (Using Supabase)

1. Make sure you're using the dev schema:
   ```bash
   npm run schema:dev
   ```

2. Push your changes to Supabase:
   ```bash
   npm run db:push:dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing Against Production Database

1. Switch to production schema:
   ```bash
   npm run schema:prod
   ```

2. Run your application:
   ```bash
   npm run dev
   ```

3. When done, switch back to dev:
   ```bash
   npm run schema:dev
   ```

## Key Differences Between Schemas

### Data Types

| Field Type | PostgreSQL | SQL Server |
|------------|------------|------------|
| Text (unlimited) | `@db.Text` | `@db.NVarChar(Max)` |
| Decimal | `@db.Decimal(18, 2)` | `@db.Decimal(18, 2)` |
| UUID | `@default(uuid())` | `@default(uuid())` |

### Relations

Both schemas maintain the same relation structure, but SQL Server uses explicit `NoAction` constraints:

```prisma
@relation(fields: [...], references: [...], onDelete: NoAction, onUpdate: NoAction)
```

## Troubleshooting

### Issue: "Environment variable not found"

**Solution**: Make sure your `.env` file has all required variables:
- `DATABASE_URL`
- `DEV_DATABASE_URL`
- `PROD_DATABASE_URL`

### Issue: "Schema not in sync"

**Solution**: Regenerate Prisma Client:
```bash
npx prisma generate
```

### Issue: "Connection refused" to Supabase

**Solution**:
1. Check your Supabase password in `.env`
2. Verify your Supabase project is active
3. Check Supabase dashboard for connection issues

### Issue: "Type mismatch" errors

**Solution**: You might be using the wrong schema. Switch to the correct one:
```bash
npm run schema:dev  # or schema:prod
```

## Best Practices

### 1. Always Know Which Schema You're Using

Check your current `schema.prisma` file header:
```prisma
// Default Schema - PostgreSQL/Supabase (Development)
```

### 2. Keep Schemas in Sync

When making schema changes:
1. Update both `schema.dev.prisma` AND `schema.prod.prisma`
2. Test against both databases before deploying
3. Keep data types compatible between both systems

### 3. Use Environment Variables

Never hardcode database credentials. Always use:
- `DATABASE_URL` for the active connection
- `DEV_DATABASE_URL` for development
- `PROD_DATABASE_URL` for production

### 4. Git Workflow

Commit all three schema files:
```bash
git add prisma/schema.prisma
git add prisma/schema.dev.prisma
git add prisma/schema.prod.prisma
git commit -m "Update database schemas"
```

## Available Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run schema:dev` | Switch to PostgreSQL/Supabase schema |
| `npm run schema:prod` | Switch to Azure SQL Server schema |
| `npm run db:push:dev` | Push schema to Supabase (no migrations) |
| `npm run db:push:prod` | Push schema to Azure SQL (no migrations) |
| `npm run db:migrate:dev` | Create and apply migrations (dev) |
| `npm run db:migrate:prod` | Deploy migrations (prod) |
| `npm run db:seed` | Seed the database with sample data |

## Migration Strategy

### Development Phase
- Use `db:push:dev` for rapid prototyping
- No migration files needed during active development

### Pre-Production
- Switch to `db:migrate:dev` to create migration files
- Test migrations thoroughly

### Production Deployment
1. Switch to production schema: `npm run schema:prod`
2. Create migration: `npx prisma migrate dev --name your_migration_name`
3. Review generated SQL in `prisma/migrations/`
4. Deploy to production: `npm run db:migrate:prod`

## Support

For issues or questions:
1. Check this guide first
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check Supabase documentation: https://supabase.com/docs
4. Review Azure SQL Server documentation

## Summary

- ✅ Development uses PostgreSQL/Supabase (free, cloud-hosted)
- ✅ Production uses Azure SQL Server (your existing database)
- ✅ Switch between schemas with simple npm scripts
- ✅ No vendor lock-in - maintain full control
- ✅ Keep both schemas in sync for seamless deployment
