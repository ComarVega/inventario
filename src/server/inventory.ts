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
  const [products, balances] = await Promise.all([
    prisma.product.findMany({
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

  return products.map((p) => {
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
