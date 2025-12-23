import { PrismaClient, Prisma } from '@prisma/client';

let prisma: PrismaClient;

interface GlobalWithPrisma {
  __prisma?: PrismaClient;
}

const globalWithPrisma = global as unknown as GlobalWithPrisma;

try {
  const devClientOptions: Prisma.PrismaClientOptions = {
    log: ['error', 'warn'],
  };
  const prodClientOptions: Prisma.PrismaClientOptions = {
    log: ['error'],
  };

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithPrisma.__prisma) {
      globalWithPrisma.__prisma = new PrismaClient(devClientOptions);
    }
    prisma = globalWithPrisma.__prisma;
  } else {
    prisma = new PrismaClient(prodClientOptions);
  }
} catch (err) {
  const errMsg = err instanceof Error ? err.message : String(err);
  console.warn('[lib/db] Could not initialize Prisma client:', errMsg);

  const createErrorProxy = (message: string) => {
    const error = new Error(message);
    const handler: ProxyHandler<() => void> = {
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
    const proxyFunc = new Proxy(() => {}, handler) as unknown as Record<string, unknown>;
    proxyFunc.$connect = async () => {
      throw error;
    };
    proxyFunc.$disconnect = async () => {
      throw error;
    };
    return proxyFunc as unknown as PrismaClient;
  };

  const msg = `[lib/db] Prisma client not initialized. Run "npx prisma generate" and restart the dev server. Original error: ${errMsg}`;

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithPrisma.__prisma) {
      globalWithPrisma.__prisma = createErrorProxy(msg);
    }
    prisma = globalWithPrisma.__prisma;
  } else {
    prisma = createErrorProxy(msg);
  }
}

export default prisma;
