import { PrismaClient } from '@prisma/client';

const connectionConfig = {
  server: 'orcr-db-server.database.windows.net',
  port: 1433,
  database: 'orcrtesting',
  user: 'cvmfinance@ORCR@orcr-db-server',
  password: 'safe@ORCR!secure@143',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let prisma: PrismaClient;

declare global {
  // allow global prisma cache in development to avoid exhausting connections
  namespace NodeJS {
    interface Global {
      __prisma?: PrismaClient;
    }
  }
}

try {
  // Try to load the MSSQL adapter dynamically. If it fails, fall back to
  // creating PrismaClient without the adapter to avoid throwing during import.
  // This prevents route handlers from crashing at import time.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const PrismaMssqlModule = require('@prisma/adapter-mssql') as any;
  const PrismaMssql = PrismaMssqlModule?.PrismaMssql;
  const adapter: any = PrismaMssql ? new PrismaMssql(connectionConfig as any) : undefined;

  const devClientOptions: any = adapter
    ? { adapter, log: ['error', 'warn'] }
    : { log: ['error', 'warn'] };
  const prodClientOptions: any = adapter ? { adapter, log: ['error'] } : { log: ['error'] };

  if (process.env.NODE_ENV === 'development') {
    const g = global as any;
    if (!g.__prisma) {
      g.__prisma = new PrismaClient(devClientOptions);
    }
    prisma = g.__prisma;
  } else {
    prisma = new PrismaClient(prodClientOptions);
  }
} catch (err) {
  const errMsg = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.warn('[lib/db] Could not initialize Prisma MSSQL adapter:', errMsg);

  // Create a lazy proxy that throws a helpful error when used. This prevents
  // Next.js from crashing during module import while giving a clear runtime
  // error instructing the developer to run `prisma generate`.
  const createErrorProxy = (message: string) => {
    const error = new Error(message);
    const handler: ProxyHandler<any> = {
      get() {
        throw error;
      },
      apply() {
        throw error;
      },
      construct() {
        throw error;
      },
    };
    const proxyFunc: any = new Proxy(() => {}, handler);
    proxyFunc.$connect = async () => {
      throw error;
    };
    proxyFunc.$disconnect = async () => {
      throw error;
    };
    return proxyFunc as unknown as PrismaClient;
  };

  const msg = `[lib/db] Prisma client not initialized. Run \"npx prisma generate\" and restart the dev server. Original error: ${errMsg}`;

  if (process.env.NODE_ENV === 'development') {
    const g = global as any;
    if (!g.__prisma) {
      g.__prisma = createErrorProxy(msg);
    }
    prisma = g.__prisma;
  } else {
    prisma = createErrorProxy(msg);
  }
}

export default prisma;
