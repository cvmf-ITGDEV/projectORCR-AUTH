# Quick Start: Supabase Setup

## Setup Status

Your Supabase database is already configured and ready to use!

- Database schema has been applied via Supabase migrations
- Demo user accounts are created
- Philippine geographic data (regions, provinces, cities, barangays) is loaded
- System settings are configured

## Initial Configuration

### 1. Set Up Environment Variables

If you haven't already, copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `JWT_SECRET` - A secure random string for JWT signing

See `.env.example` for detailed instructions on getting these values.

## Demo Accounts

The following test accounts are available:

- **Admin**: admin@lending.ph / Password123!
- **Processor**: processor@lending.ph / Password123!
- **Approver**: approver@lending.ph / Password123!

### 2. Generate Prisma Client

```bash
npm run schema:dev
```

This generates the Prisma client for Supabase/PostgreSQL and validates your configuration.

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

On startup, the application will:
- Validate all required environment variables
- Check database connectivity
- Initialize system settings if needed
- Display configuration status in the console

### 2. Build for Production

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

## Configuration Management

### Environment Variables

The application uses centralized configuration management via `src/lib/config.ts`. All environment variables are validated on startup with helpful error messages if anything is missing.

**Required variables:**
- `DATABASE_URL` - Supabase connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - Secret for JWT token signing (32+ characters recommended)

**Optional variables:**
- `WEB_CONTAINER` - Set to "true" for WebContainer environments
- `NODE_ENV` - Automatically set by Next.js

### System Settings

System settings are stored in the database and managed via `src/lib/settings.ts`. These can be updated at runtime and are cached for performance.

**Default settings include:**
- Default interest rate: 8.5%
- Loan amounts: 5,000 - 1,000,000
- Application fee: 500
- Processing fee: 2.5%
- Max loan term: 36 months
- Contact information
- Business hours

The system automatically initializes these settings if they don't exist in the database.

---

For detailed architecture documentation, see **DUAL_SCHEMA_SETUP.md** and **README.md**
