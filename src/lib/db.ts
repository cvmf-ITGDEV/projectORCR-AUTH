import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function validateDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please add a valid PostgreSQL connection string to your .env file.\n' +
      'Example: DATABASE_URL="postgresql://user:password@host:5432/database"'
    );
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL must be a valid PostgreSQL connection string.\n' +
      'Expected format: postgresql://user:password@host:5432/database'
    );
  }

 

  return databaseUrl;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = validateDatabaseUrl();

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool as never);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
