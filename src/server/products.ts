import { prisma } from "@/server/db"

export async function listProducts(userId?: string, userRole?: string, activeWarehouseId?: string) {
    // Si no hay sesión, devolver vacío
    if (!userId) {
        return []
    }
    
    // ADMIN puede filtrar por warehouse si hay uno seleccionado
    if (userRole === "ADMIN") {
        // Si hay warehouse seleccionado, filtrar solo productos de ese warehouse
        if (activeWarehouseId) {
            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { isDemo: false },
                        { isDemo: true, expiresAt: { gt: new Date() } }
                    ],
                    balances: {
                        some: {
                            warehouseId: activeWarehouseId
                        }
                    }
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
                    balances: {
                        where: {
                            warehouseId: activeWarehouseId
                        },
                        select: {
                            warehouseId: true,
                            warehouse: {
                                select: { name: true, code: true }
                            }
                        },
                        take: 1
                    }
                },
            })
            
            return products.map(p => ({
                ...p,
                warehouseName: p.balances[0]?.warehouse.name ?? "-",
                warehouseId: p.balances[0]?.warehouseId,
                balances: undefined
            }))
        }
        
        // Sin warehouse seleccionado, mostrar todos los productos
        const products = await prisma.product.findMany({
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
                balances: {
                    select: {
                        warehouseId: true,
                        warehouse: {
                            select: { name: true, code: true }
                        }
                    },
                    take: 1
                }
            },
        })
        
        return products.map(p => ({
            ...p,
            warehouseName: p.balances[0]?.warehouse.name ?? "-",
            warehouseId: p.balances[0]?.warehouseId,
            balances: undefined
        }))
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
    
    const products = await prisma.product.findMany({
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
            balances: {
                where: {
                    warehouseId: { in: warehouseIds }
                },
                select: {
                    warehouseId: true,
                    warehouse: {
                        select: { name: true, code: true }
                    }
                },
                take: 1
            }
        },
    })
    
    return products.map(p => ({
        ...p,
        warehouseName: p.balances[0]?.warehouse.name ?? "-",
        warehouseId: p.balances[0]?.warehouseId,
        balances: undefined
    }))
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