// import path from 'node:path';
// import { defineConfig } from 'prisma/config';

// export default defineConfig({
//   schema: path.join(__dirname, 'schema.prisma'),
//   datasource: {
//     url: process.env.DATABASE_URL || '',
//   },
// });
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing in Bolt');
}
console.log( path.join(__dirname, 'schema.prisma'))
export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    adapter: new PrismaNeon(
      new Pool({ connectionString: process.env.DATABASE_URL }) as never
    ),
  },
});
