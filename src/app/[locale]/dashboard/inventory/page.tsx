import { getActiveWarehouseId, getWarehouses } from "@/server/warehouses"
import { listInventoryByWarehouse } from "@/server/inventory"
import { InventoryTable, type InventoryRow as UiRow } from "@/components/inventory/inventory-table"

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const warehouses = await getWarehouses()
  const activeWarehouseId = await getActiveWarehouseId()

  if (!activeWarehouseId) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{locale === "fr" ? "Inventaire" : "Inventory"}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Sélectionnez un entrepôt en haut à droite."
            : "Select a warehouse from the top-right selector."}
        </p>
        <p className="text-sm text-slate-500">
          Warehouses found: {warehouses.length}
        </p>
      </div>
    )
  }

  const rows = await listInventoryByWarehouse(activeWarehouseId)

  const uiRows: UiRow[] = rows.map((r) => ({
    ...r,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{locale === "fr" ? "Inventaire" : "Inventory"}</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {locale === "fr"
              ? "Stock par produit pour l'entrepôt sélectionné."
              : "Stock per product for the selected warehouse."}
          </p>
        </div>
        <a
          className="inline-flex items-center justify-center rounded-md border bg-white dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-100"
          href={`/api/export/inventory?warehouseId=${encodeURIComponent(activeWarehouseId)}`}
        >
          Export CSV
        </a>
      </div>

      <InventoryTable rows={uiRows} />
    </div>
  )
}
