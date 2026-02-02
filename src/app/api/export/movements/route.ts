import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

function toDateParam(v: string | null): Date | null {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const warehouseId = url.searchParams.get("warehouseId")
  if (!warehouseId) {
    return NextResponse.json({ error: "warehouseId is required" }, { status: 400 })
  }

  const type = url.searchParams.get("type") // IN/OUT/ADJUST/TRANSFER/ALL
  const q = url.searchParams.get("q")?.trim() ?? ""
  const from = toDateParam(url.searchParams.get("from"))
  const to = toDateParam(url.searchParams.get("to"))

  const rows = await prisma.stockMovement.findMany({
    where: {
      OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
      ...(type && type !== "ALL" ? { type: type as "IN" | "OUT" | "ADJUST" | "TRANSFER" } : {}),
      ...(from || to
        ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
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
    take: 5000,
    select: {
      createdAt: true,
      type: true,
      quantity: true,
      note: true,
      createdByUser: { select: { name: true, email: true } },
      product: { select: { sku: true, name: true, barcode: true } },
      fromWarehouse: { select: { code: true } },
      toWarehouse: { select: { code: true } },
    },
  })

  const header = ["createdAt", "type", "quantity", "sku", "name", "barcode", "from", "to", "createdBy", "note"]
  const lines = [header.join(",")]

  for (const r of rows) {
    const vals = [
      r.createdAt.toISOString(),
      r.type,
      String(r.quantity),
      r.product.sku,
      r.product.name.replaceAll('"', '""'),
      r.product.barcode ?? "",
      r.fromWarehouse?.code ?? "",
      r.toWarehouse?.code ?? "",
      r.createdByUser?.name ?? r.createdByUser?.email ?? "",
      (r.note ?? "").replaceAll('"', '""'),
    ].map((v) => `"${v}"`)
    lines.push(vals.join(","))
  }

  const csv = lines.join("\n")
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="movements_${warehouseId}.csv"`,
    },
  })
}
