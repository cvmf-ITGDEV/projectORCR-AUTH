import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';

neonConfig.webSocketConstructor = WebSocket;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Environment variables available:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
    throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
  }

  console.log('Database URL type:', databaseUrl.split('://')[0]);

  let adapter;

  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.log('Creating Neon Pool with connection string');
    const pool = new Pool({ connectionString: databaseUrl });
    adapter = new PrismaNeon(pool as never);
  } else if (databaseUrl.startsWith('sqlserver://')) {
    console.log('Creating MSSQL adapter with connection string');
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
