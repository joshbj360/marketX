import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('[db] DATABASE_URL is not set in environment variables')
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  })

  // Swallow idle-connection errors from Neon auto-suspend.
  // Without this listener, Node.js throws an uncaughtException and crashes.
  pool.on('error', (err) => {
    console.warn('[db] pg pool connection dropped (Neon suspend?):', err.message)
  })

  // Warm one connection on startup so the first request isn't cold
  pool.connect().then((c) => c.release()).catch(() => {})

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Persist across HMR reloads in dev so we don't recreate the pool on every save
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
