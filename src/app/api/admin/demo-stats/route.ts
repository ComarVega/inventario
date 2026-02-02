import { NextResponse } from 'next/server'
import { getDemoDataStats } from '@/server/cleanup'
import { requireAdmin } from '@/server/rbac'

export const dynamic = 'force-dynamic'

/**
 * Endpoint para ver estadísticas de datos demo (solo ADMIN)
 * GET /api/admin/demo-stats
 */
export async function GET() {
  try {
    await requireAdmin()
    
    const stats = await getDemoDataStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unauthorized'
      },
      { status: 403 }
    )
  }
}
