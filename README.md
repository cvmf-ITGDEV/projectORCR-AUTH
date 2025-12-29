# Loan Management System

A comprehensive loan application processing and receipt management system built with Next.js, TypeScript, and Supabase.

## Features

- Loan application management with multi-step wizard
- Receipt generation and tracking
- User authentication and role-based access control
- Dashboard with statistics and analytics
- Philippine geographic data (regions, provinces, cities, barangays)
- System settings management
- Audit logging

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: JWT-based auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd project
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
# Get these from your Supabase project dashboard
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Generate a secure JWT secret
JWT_SECRET="your-secure-random-jwt-secret"
```

#### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** > **Database** to get `DATABASE_URL`
4. Navigate to **Settings** > **API** to get:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)

### 3. Set Up Database Schema

The database schema is already applied via Supabase migrations. Generate the Prisma client:

```bash
npm run schema:dev
```

### 4. Seed the Database (Optional)

Seed the database with demo data:

```bash
npm run db:seed
```

This creates:
- 3 demo user accounts
- Philippine geographic data (regions, provinces, cities, barangays)
- System settings with default values

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login with Demo Account

- **Email**: admin@lending.ph
- **Password**: Password123!

Other demo accounts:
- Processor: processor@lending.ph / Password123!
- Approver: approver@lending.ph / Password123!

## Configuration Management

### Environment Variables

The application uses environment variables for configuration. See `.env.example` for all available options.

**Required Variables:**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - Secret for signing JWT tokens

**Optional Variables:**
- `WEB_CONTAINER` - Set to "true" for WebContainer/StackBlitz environments
- `NODE_ENV` - Environment (development/production)

### System Settings

System settings are stored in the database and can be updated at runtime. Default settings include:

- **Loan Configuration**: Interest rates, loan amounts, terms
- **Fees**: Application and processing fees
- **Business Settings**: Business hours, contact information
- **Features**: Email notifications, maintenance mode

Settings are cached for 5 minutes to improve performance.

## Project Structure

```
project/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── applications/      # Loan applications
│   │   ├── dashboard/         # Dashboard
│   │   ├── login/            # Authentication
│   │   └── receipts/         # Receipt management
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   └── loan/             # Loan application wizard
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utilities and libraries
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── config.ts        # Configuration management
│   │   ├── db.ts            # Database client
│   │   └── settings.ts      # System settings manager
│   ├── theme/               # Material UI theme
│   └── types/               # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding script
└── supabase/
    └── migrations/          # Database migrations

```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run schema:dev` | Generate Prisma client (Supabase) |
| `npm run schema:prod` | Generate Prisma client (Azure SQL) |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:push:dev` | Push schema to Supabase |

## Database Schema

The system uses the following main entities:

- **Users**: System users with roles (ADMIN, PROCESSOR, APPROVER)
- **Loan Applications**: Loan application records with multi-step data
- **Receipts**: Payment receipts linked to applications
- **Documents**: File uploads for applications
- **Geographic Data**: Philippine PSGC data (regions, provinces, cities, barangays)
- **System Settings**: Configurable system parameters
- **Audit Logs**: Activity tracking and audit trail

## Dual Schema Support

This project supports both PostgreSQL (Supabase) and Azure SQL Server:

- **Development**: Uses Supabase/PostgreSQL (default)
- **Production**: Can use Azure SQL Server

Switch schemas using:
```bash
npm run schema:dev  # Use Supabase
npm run schema:prod # Use Azure SQL Server
```

See `DUAL_SCHEMA_SETUP.md` for detailed information.

## Security

- JWT-based authentication with secure token handling
- Password hashing with bcrypt
- Environment variable validation on startup
- Input validation and sanitization
- Role-based access control (RBAC)

## Troubleshooting

### Build Errors

```bash
npm run schema:dev
npm run build
```

### Database Connection Issues

- Verify `DATABASE_URL` in `.env` is correct
- Check Supabase project status in dashboard
- Ensure network connectivity to Supabase

### Type Errors

Make sure Prisma client is generated:
```bash
npm run schema:dev
```

### Authentication Issues

- Verify `JWT_SECRET` is set and secure (32+ characters)
- Check that demo users exist in database
- Clear browser cookies and try again

## Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [DUAL_SCHEMA_SETUP.md](./DUAL_SCHEMA_SETUP.md) - Dual schema architecture

## License

This project is private and proprietary.
