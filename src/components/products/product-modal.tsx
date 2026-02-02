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
  cancel: string
  create: string
  save: string
  errorGeneric: string
}

export function ProductModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSubmit,
  labels,
}: {
  open: boolean
  mode: "create" | "edit"
  initial?: Partial<ProductFormValues>
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProductFormValues) => Promise<void>
  labels: Labels
}) {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [values, setValues] = React.useState<ProductFormValues>({
    sku: initial?.sku ?? "",
    name: initial?.name ?? "",
    barcode: initial?.barcode ?? "",
    unit: initial?.unit ?? "ea",
  })

  // Si cambian initial/mode (abrimos edit sobre otro producto), refresca formulario
  React.useEffect(() => {
    setValues({
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      barcode: initial?.barcode ?? "",
      unit: initial?.unit ?? "ea",
    })
    setError(null)
  }, [initial?.sku, initial?.name, initial?.barcode, initial?.unit, mode, open])

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
