import { NextResponse } from 'next/server'
import { cleanupExpiredDemoData } from '@/server/cleanup'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Cron endpoint para limpieza automática de datos demo
 * Configurar en cron-job.org o similar:
 * GET https://demo-inventory.ecotechcare.ca/api/cron/cleanup
 * Frecuencia: Cada 15 minutos
 * 
 * Protección: Usar header secreto en producción
 */
export async function GET(request: Request) {
  try {
    // Verificar secreto en producción
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const result = await cleanupExpiredDemoData()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    })
  } catch (error) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
