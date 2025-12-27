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

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (Bolt Environment Variables)');
}

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
