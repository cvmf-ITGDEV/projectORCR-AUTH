import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

export const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    url: process.env.DATABASE_URL, // your Bolt AI/Postgres connection string
  }),
});
