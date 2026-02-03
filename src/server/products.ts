import { prisma } from "@/server/db"

export async function listProducts(userId?: string, userRole?: string) {
    // Si no hay sesión, devolver vacío
    if (!userId) {
        return []
    }
    
    // ADMIN ve todos los productos
    if (userRole === "ADMIN") {
        return prisma.product.findMany({
            where: {
                OR: [
                    { isDemo: false },
                    { isDemo: true, expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                sku: true,
                name: true,
                barcode: true,
                unit: true,
                isDemo: true,
                expiresAt: true,
                updatedAt: true,
                createdAt: true,
            },
        })
    }
    
    // STAFF y VIEWER solo ven productos que tienen stock en sus warehouses asignados
    const userWarehouses = await prisma.userWarehouse.findMany({
        where: { userId },
        select: { warehouseId: true }
    })
    
    const warehouseIds = userWarehouses.map(uw => uw.warehouseId)
    
    if (warehouseIds.length === 0) {
        return []
    }
    
    // Obtener IDs de productos que tienen balance en los warehouses del usuario
    const productIds = await prisma.inventoryBalance.findMany({
        where: {
            warehouseId: { in: warehouseIds }
        },
        select: { productId: true },
        distinct: ['productId']
    })
    
    const productIdSet = new Set(productIds.map(p => p.productId))
    
    return prisma.product.findMany({
        where: {
            id: { in: Array.from(productIdSet) },
            OR: [
                { isDemo: false },
                { isDemo: true, expiresAt: { gt: new Date() } }
            ]
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            sku: true,
            name: true,
            barcode: true,
            unit: true,
            isDemo: true,
            expiresAt: true,
            updatedAt: true,
            createdAt: true,
        },
    })
}



export async function getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku:true,
        name: true,
        barcode: true,
        unit: true,
      },
    })
}