import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrisma = () => {
  const adapter = process.env.DATABASE_URL ? new PrismaMssql(process.env.DATABASE_URL) : undefined;
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  } as any);
};

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
