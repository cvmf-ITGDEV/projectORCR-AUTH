import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const databaseUrl = process.env.DATABASE_URL;

  let adapter;

  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    const pool = new Pool({ connectionString: databaseUrl });
    adapter = new PrismaNeon(pool as never);
  } else if (databaseUrl.startsWith('sqlserver://')) {
    adapter = new PrismaMssql(databaseUrl);
  } else {
    throw new Error('Unsupported database type. Use PostgreSQL or SQL Server connection string.');
  }

  return new PrismaClient({
    adapter: adapter as never,
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
