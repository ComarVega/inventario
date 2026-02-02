import { db } from "./db"

/**
 * Elimina productos y usuarios de demo que han expirado (más de 1 hora)
 * Ejecutar este cron job cada 15 minutos o usar en API route
 */
export async function cleanupExpiredDemoData() {
  const now = new Date()
  
  try {
    // Eliminar productos de demo expirados
    const deletedProducts = await db.product.deleteMany({
      where: {
        isDemo: true,
        expiresAt: {
          lte: now
        }
      }
    })

    // Eliminar usuarios de demo expirados (excepto admin original)
    const deletedUsers = await db.user.deleteMany({
      where: {
        isDemo: true,
        expiresAt: {
          lte: now
        },
        NOT: {
          email: "admin@example.com" // Proteger admin del seed
        }
      }
    })

    console.log(`[CLEANUP] Eliminados ${deletedProducts.count} productos demo expirados`)
    console.log(`[CLEANUP] Eliminados ${deletedUsers.count} usuarios demo expirados`)

    return {
      success: true,
      productsDeleted: deletedProducts.count,
      usersDeleted: deletedUsers.count
    }
  } catch (error) {
    console.error("[CLEANUP ERROR]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Marca un producto como demo con expiración en 1 hora
 */
export async function markProductAsDemo(productId: string, retentionHours = 1) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + retentionHours)

  await db.product.update({
    where: { id: productId },
    data: {
      isDemo: true,
      expiresAt
    }
  })
}

/**
 * Marca un usuario como demo con expiración en 1 hora
 */
export async function markUserAsDemo(userId: string, retentionHours = 1) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + retentionHours)

  await db.user.update({
    where: { id: userId },
    data: {
      isDemo: true,
      expiresAt
    }
  })
}

/**
 * Obtener estadísticas de datos demo
 */
export async function getDemoDataStats() {
  const now = new Date()

  const [totalDemoProducts, expiredProducts, totalDemoUsers, expiredUsers] = await Promise.all([
    db.product.count({ where: { isDemo: true } }),
    db.product.count({ where: { isDemo: true, expiresAt: { lte: now } } }),
    db.user.count({ where: { isDemo: true } }),
    db.user.count({ where: { isDemo: true, expiresAt: { lte: now } } })
  ])

  return {
    products: {
      total: totalDemoProducts,
      expired: expiredProducts,
      active: totalDemoProducts - expiredProducts
    },
    users: {
      total: totalDemoUsers,
      expired: expiredUsers,
      active: totalDemoUsers - expiredUsers
    }
  }
}
