import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { auth } from "@/auth"

export const runtime = "nodejs"

function esc(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const warehouseId = url.searchParams.get("warehouseId")
  if (!warehouseId) return NextResponse.json({ error: "warehouseId required" }, { status: 400 })

  const rows = await prisma.stockMovement.findMany({
    where: { OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }] },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      createdAt: true,
      type: true,
      quantity: true,
      note: true,
      product: { select: { sku: true, name: true } },
      createdByUser: { select: { email: true } },
    },
  })

  // HTML → PDF via browser is heavy. Aquí generamos un PDF “simple” usando HTML como fallback:
  // En Vercel, lo mejor es usar un servicio o playwright. Para ahora: devolvemos HTML printable.
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Movements</title></head>
<body style="font-family: system-ui; padding: 24px;">
<h1>Movements (warehouse ${esc(warehouseId)})</h1>
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;">
<tr>
<th>When</th><th>Type</th><th>Qty</th><th>SKU</th><th>Name</th><th>By</th><th>Note</th>
</tr>
${rows
  .map(
    (r) => `<tr>
<td>${esc(r.createdAt.toISOString())}</td>
<td>${esc(r.type)}</td>
<td style="text-align:right;">${r.quantity}</td>
<td>${esc(r.product.sku)}</td>
<td>${esc(r.product.name)}</td>
<td>${esc(r.createdByUser?.email ?? "")}</td>
<td>${esc(r.note ?? "")}</td>
</tr>`
  )
  .join("")}
</table>
<p style="margin-top: 16px; color:#555;">Tip: Print to PDF from your browser.</p>
</body></html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
