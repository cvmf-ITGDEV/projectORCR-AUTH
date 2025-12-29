import path from 'node:path'
import { defineConfig } from 'prisma/config'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing')
}

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
