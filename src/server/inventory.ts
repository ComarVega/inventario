import { prisma } from "@/server/db"

export type InventoryRow = {
  productId: string
  sku: string
  name: string
  barcode: string | null
  unit: string
  quantity: number
  updatedAt: Date | null
}

export async function listInventoryByWarehouse(warehouseId: string): Promise<InventoryRow[]> {
  // Obtener info del warehouse para saber si es MAIN
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: { code: true }
  })
  
  const isMainWarehouse = warehouse?.code === 'EDM-MAIN'
  
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

  // Si es MAIN, mostrar todos los productos
  // Si no, mostrar solo productos que tienen stock en este warehouse
  return products
    .filter(p => isMainWarehouse || byProductId.has(p.id))
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
      }
    })
}
