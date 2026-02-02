import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { validateEnv } from "@/lib/env"

// Validar variables de entorno al inicio
validateEnv()

const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient
  pool?: Pool 
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

const pool = globalForPrisma.pool ?? new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Configuraciones de seguridad
  max: 20, // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}

export const db = prisma
