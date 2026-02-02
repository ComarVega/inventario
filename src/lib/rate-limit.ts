import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting simple con Map en memoria
// Para producción seria, usar Redis o Upstash
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests por minuto

export function rateLimit(ip: string): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Nueva ventana o expirada
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitMap.set(ip, { count: 1, resetTime })
    return {
      success: true,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime
    }
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Límite excedido
    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  // Incrementar contador
  record.count++
  rateLimitMap.set(ip, record)

  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    resetTime: record.resetTime
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return 'unknown'
}

// Limpiar registros expirados cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)
