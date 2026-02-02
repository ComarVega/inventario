import { prisma } from "@/server/db"

export type MovementTypeUi = "IN" | "OUT" | "ADJUST" | "TRANSFER"

export type MovementRow = {
  id: string
  type: MovementTypeUi
  quantity: number
  note: string | null
  createdAt: Date
  createdByUser: { name: string | null; email: string | null } | null
  product: { sku: string; name: string; barcode: string | null }
  fromWarehouse: { code: string; name: string } | null
  toWarehouse: { code: string; name: string } | null
}

export type MovementFilters = {
  warehouseId: string
  type?: MovementTypeUi | "ALL"
  q?: string
  from?: Date
  to?: Date
  take?: number
}

export async function listMovements(filters: MovementFilters): Promise<MovementRow[]> {
  const take = filters.take ?? 100
  const q = filters.q?.trim()

  return prisma.stockMovement.findMany({
    where: {
      OR: [{ fromWarehouseId: filters.warehouseId }, { toWarehouseId: filters.warehouseId }],
      ...(filters.type && filters.type !== "ALL" ? { type: filters.type } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            product: {
              OR: [
                { sku: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { barcode: { contains: q, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      quantity: true,
      note: true,
      createdAt: true,
      createdByUser: { select: { name: true, email: true } },
      product: { select: { sku: true, name: true, barcode: true } },
      fromWarehouse: { select: { code: true, name: true } },
      toWarehouse: { select: { code: true, name: true } },
    },
  })
}
