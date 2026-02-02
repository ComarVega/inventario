import { z } from 'zod'

/**
 * Validación de variables de entorno requeridas
 * Lanzar error si faltan variables críticas
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // NextAuth (opcionales para seed/migrations)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres').optional(),
  
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional: Cron protection
  CRON_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validar variables de entorno al iniciar
 * Llamar en src/server/db.ts o en layout.tsx
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      CRON_SECRET: process.env.CRON_SECRET,
    })
    
    return env
  } catch (error) {
    console.error('❌ Error de configuración de variables de entorno:')
    console.error(error)
    throw new Error('Variables de entorno inválidas o faltantes')
  }
}

/**
 * Obtener variable de entorno de forma segura
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const value = process.env[key]
  
  if (!value && key !== 'CRON_SECRET' && key !== 'NODE_ENV') {
    throw new Error(`Variable de entorno ${key} no está definida`)
  }
  
  return value as Env[K]
}

/**
 * Verificar si estamos en producción
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Verificar si estamos en desarrollo
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}
