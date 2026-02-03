"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type InventoryRow = {
  productId: string
  sku: string
  name: string
  barcode: string | null
  unit: string
  quantity: number
  updatedAt: string | null
  warehouseName?: string
}

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const [q, setQ] = React.useState("")

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => {
      return (
        r.sku.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s) ||
        (r.barcode ?? "").toLowerCase().includes(s)
      )
    })
  }, [q, rows])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by SKU / name / barcode..."
          className="max-w-md"
        />
        <div className="text-sm text-slate-600 dark:text-slate-400">{filtered.length} items</div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="w-45">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                  No results.
                </TableCell>
              </TableRow>
            ) : null}

            {filtered.map((r) => (
              <TableRow key={r.productId}>
                <TableCell className="font-medium dark:text-slate-100">{r.sku}</TableCell>
                <TableCell className="dark:text-slate-300">{r.warehouseName ?? "-"}</TableCell>
                <TableCell className="dark:text-slate-200">{r.name}</TableCell>
                <TableCell className="dark:text-slate-300">{r.barcode ?? "-"}</TableCell>
                <TableCell className="dark:text-slate-300">{r.unit}</TableCell>
                <TableCell className="text-right dark:text-slate-100">{r.quantity}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
