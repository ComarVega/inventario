"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type MovementHistoryRow = {
  id: string
  type: "IN" | "OUT" | "ADJUST" | "TRANSFER"
  quantity: number
  note: string | null
  createdAt: string
  sku: string
  name: string
  from: string | null
  to: string | null
}

export function MovementsHistory({ rows }: { rows: MovementHistoryRow[] }) {
  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-slate-500 dark:text-slate-400">
                No movements yet.
              </TableCell>
            </TableRow>
          ) : null}

          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-slate-600 dark:text-slate-400">
                {new Date(r.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="font-medium dark:text-slate-100">{r.type}</TableCell>
              <TableCell className="text-right tabular-nums dark:text-slate-100">{r.quantity}</TableCell>
              <TableCell className="font-medium dark:text-slate-100">{r.sku}</TableCell>
              <TableCell className="dark:text-slate-200">{r.name}</TableCell>
              <TableCell className="dark:text-slate-300">{r.from ?? "-"}</TableCell>
              <TableCell className="dark:text-slate-300">{r.to ?? "-"}</TableCell>
              <TableCell className="text-slate-600 dark:text-slate-400">{r.note ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
