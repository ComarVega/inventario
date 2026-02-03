"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ProductFormValues = {
  sku: string
  name: string
  barcode: string
  unit: string
  warehouseId?: string
}

export type ProductRow = {
  id: string
  sku: string
  name: string
  barcode: string | null
  unit: string
}

type Labels = {
  createTitle: string
  editTitle: string
  sku: string
  name: string
  barcode: string
  unit: string
  warehouse: string
  cancel: string
  create: string
  save: string
  errorGeneric: string
}

type Warehouse = {
  id: string
  name: string
}

export function ProductModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSubmit,
  labels,
  warehouses,
  currentWarehouseId,
}: {
  open: boolean
  mode: "create" | "edit"
  initial?: Partial<ProductFormValues>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProductFormValues) => Promise<void>
  labels: Labels
  warehouses?: Warehouse[]
  currentWarehouseId?: string
}) {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [values, setValues] = React.useState<ProductFormValues>({
    sku: initial?.sku ?? "",
    name: initial?.name ?? "",
    barcode: initial?.barcode ?? "",
    unit: initial?.unit ?? "ea",
    warehouseId: initial?.warehouseId ?? currentWarehouseId,
  })

  // Si cambian initial/mode (abrimos edit sobre otro producto), refresca formulario
  React.useEffect(() => {
    setValues({
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      barcode: initial?.barcode ?? "",
      unit: initial?.unit ?? "ea",
      warehouseId: initial?.warehouseId ?? currentWarehouseId,
    })
    setError(null)
  }, [initial?.sku, initial?.name, initial?.barcode, initial?.unit, initial?.warehouseId, currentWarehouseId, mode, open])

  function set<K extends keyof ProductFormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? labels.createTitle : labels.editTitle}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">{labels.sku}</Label>
            <Input
              id="sku"
              value={values.sku}
              onChange={(e) => set("sku", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">{labels.name}</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="barcode">{labels.barcode}</Label>
            <Input
              id="barcode"
              value={values.barcode}
              onChange={(e) => set("barcode", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">{labels.unit}</Label>
            <Input
              id="unit"
              value={values.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="ea"
            />
          </div>

          {warehouses && warehouses.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="warehouse">{labels.warehouse}</Label>
              <select
                id="warehouse"
                value={values.warehouseId ?? ""}
                onChange={(e) => set("warehouseId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {mode === "create" ? labels.create : labels.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
