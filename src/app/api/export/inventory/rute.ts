import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const warehouseId = url.searchParams.get("warehouseId")
  if (!warehouseId) {
    return NextResponse.json({ error: "warehouseId is required" }, { status: 400 })
  }

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

  const header = ["sku", "name", "barcode", "unit", "quantity", "updatedAt"]
  const lines = [header.join(",")]

  for (const p of products) {
    const b = byProductId.get(p.id)
    const vals = [
      p.sku,
      p.name.replaceAll('"', '""'),
      p.barcode ?? "",
      p.unit,
      String(b?.quantity ?? 0),
      b?.updatedAt ? b.updatedAt.toISOString() : "",
    ].map((v) => `"${v}"`)
    lines.push(vals.join(","))
  }

  const csv = lines.join("\n")
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory_${warehouseId}.csv"`,
    },
  })
}
