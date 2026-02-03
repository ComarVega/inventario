import { NextResponse } from "next/server"
import { listInventoryByWarehouse } from "@/server/inventory"
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()
  const url = new URL(req.url)
  const warehouseId = url.searchParams.get("warehouseId")
  if (!warehouseId) {
    return NextResponse.json({ error: "warehouseId is required" }, { status: 400 })
  }

  const rows = await listInventoryByWarehouse(warehouseId, session?.user?.role)

  const header = ["sku", "name", "barcode", "unit", "quantity", "updatedAt"]
  const lines = [header.join(",")]

  for (const r of rows) {
    const vals = [
      r.sku,
      r.name.replaceAll('"', '""'),
      r.barcode ?? "",
      r.unit,
      String(r.quantity),
      r.updatedAt ? r.updatedAt.toISOString() : "",
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
