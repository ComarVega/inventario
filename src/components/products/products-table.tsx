"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"

export type ProductRow = {
  id: string
  sku: string
  name: string
  barcode: string | null
  unit: string
  warehouseName?: string
  warehouseId?: string
}

export function ProductsTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: ProductRow[]
  onEdit: (row: ProductRow) => void
  onDelete: (row: ProductRow) => void
}) {
  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="w-35 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400">
                No products yet.
              </TableCell>
            </TableRow>
          ) : null}

          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium dark:text-slate-100">{r.sku}</TableCell>
              <TableCell className="dark:text-slate-300">{r.warehouseName ?? "-"}</TableCell>
              <TableCell className="dark:text-slate-200">{r.name}</TableCell>
              <TableCell className="dark:text-slate-300">{r.barcode ?? "-"}</TableCell>
              <TableCell className="dark:text-slate-300">{r.unit}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="outline" onClick={() => onEdit(r)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => onDelete(r)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
