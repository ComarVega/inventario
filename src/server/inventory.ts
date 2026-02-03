import { prisma } from "@/server/db"

export type InventoryRow = {
  productId: string
  sku: string
  name: string
  barcode: string | null
  unit: string
  quantity: number
  updatedAt: Date | null
  warehouseName?: string
}

export async function listInventoryByWarehouse(
  warehouseId: string, 
  userRole?: string
): Promise<InventoryRow[]> {
  // Obtener info del warehouse para saber si es MAIN
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: { code: true, name: true }
  })
  
  const isMainWarehouse = warehouse?.code === 'EDM-MAIN'
  const isAdmin = userRole === 'ADMIN'
  
  // Solo ADMIN puede ver todos los productos en MAIN
  // STAFF y VIEWER siempre ven solo productos con stock
  const showAllProducts = isMainWarehouse && isAdmin
  
  const [products, balances] = await Promise.all([
    prisma.product.findMany({
      where: {
        isDemo: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { name: "asc" },
      select: { id: true, sku: true, name: true, barcode: true, unit: true },
    }),
    prisma.inventoryBalance.findMany({
      where: { warehouseId },
      select: { productId: true, quantity: true, updatedAt: true },
    }),
  ])

  const byProductId = new Map<string, { quantity: number; updatedAt: Date }>()
  for (const b of balances) byProductId.set(b.productId, { quantity: b.quantity, updatedAt: b.updatedAt })

  // Filtrar productos según el rol y el warehouse
  return products
    .filter(p => showAllProducts || byProductId.has(p.id))
    .map((p) => {
      const b = byProductId.get(p.id)
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
        unit: p.unit,
        quantity: b?.quantity ?? 0,
        updatedAt: b?.updatedAt ?? null,
        warehouseName: warehouse?.name ?? "-",
      }
    })
}
