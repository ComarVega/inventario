import { getActiveWarehouseId, getWarehouses } from "@/server/warehouses"
import { listMovements } from "@/server/movements"
import { requireUser } from "@/server/auth"
import MovementsClient from "./movements-client"

type MovementTypeUi = "ALL" | "IN" | "OUT" | "ADJUST" | "TRANSFER"
type RangeUi = "7d" | "30d" | "all"

function parseRange(v: string | null): RangeUi {
  if (v === "7d" || v === "30d" || v === "all") return v
  return "7d"
}

function parseType(v: string | null): MovementTypeUi {
  if (v === "ALL" || v === "IN" || v === "OUT" || v === "ADJUST" || v === "TRANSFER") return v
  return "ALL"
}

export default async function MovementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const sp = await searchParams
  const user = await requireUser()

  const warehouses = await getWarehouses()
  const activeWarehouseId = await getActiveWarehouseId()

  const type = parseType(typeof sp.type === "string" ? sp.type : null)
  const range = parseRange(typeof sp.range === "string" ? sp.range : null)
  const q = typeof sp.q === "string" ? sp.q : ""

  const now = new Date()
  const from =
    range === "7d" ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
    range === "30d" ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) :
    undefined

  const history =
    activeWarehouseId
      ? await listMovements({ warehouseId: activeWarehouseId, type, q, from, take: 100 })
      : []

  const historyUi = history.map((m) => ({
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    note: m.note,
    createdAt: m.createdAt.toISOString(),
    sku: m.product.sku,
    name: m.product.name,
    from: m.fromWarehouse ? `${m.fromWarehouse.name} (${m.fromWarehouse.code})` : null,
    to: m.toWarehouse ? `${m.toWarehouse.name} (${m.toWarehouse.code})` : null,
  }))

  return (
    <MovementsClient
      locale={locale}
      warehouses={warehouses}
      activeWarehouseId={activeWarehouseId}
      history={historyUi}
      currentFilters={{ type, q, range }}
      userRole={user.role}
    />
  )
}
