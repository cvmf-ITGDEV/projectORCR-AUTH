# Quick Start: Dual Schema Setup

## 1. Get Your Supabase Password

1. Visit: https://supabase.com/dashboard
2. Select project: **0ec90b57d6e95fcbda19832f**
3. Go to: **Settings → Database**
4. Copy your database password

## 2. Update .env File

Replace `[YOUR-PASSWORD]` in the `DATABASE_URL` with your actual Supabase password:

```env
DATABASE_URL="postgresql://postgres.0ec90b57d6e95fcbda19832f:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

## 3. Switch to Development Schema

```bash
npm run schema:dev
```

## 4. Push Schema to Supabase

```bash
npm run db:push:dev
```

## 5. Seed the Database (Optional)

```bash
npm run db:seed
```

## 6. Start Development

```bash
npm run dev
```

---

## Switch to Production (Azure SQL Server)

When you need to test against Azure SQL Server:

```bash
npm run schema:prod
npm run db:push:prod
```

To switch back to development:

```bash
npm run schema:dev
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run schema:dev` | Switch to PostgreSQL/Supabase |
| `npm run schema:prod` | Switch to Azure SQL Server |
| `npm run db:push:dev` | Push schema to Supabase |
| `npm run db:push:prod` | Push schema to Azure SQL |
| `npm run db:seed` | Seed database with sample data |

---

## Troubleshooting

**Connection Error?**
- Check your Supabase password in `.env`
- Verify your Supabase project is active
- Make sure you replaced `[YOUR-PASSWORD]` with the actual password

**Schema Issues?**
```bash
npx prisma generate
```

**Wrong Database?**
Check which schema is active:
```bash
head -n 5 prisma/schema.prisma
```

---

For detailed documentation, see **DUAL_SCHEMA_SETUP.md**
