"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductsTable, type ProductRow } from "@/components/products/products-table"
import { ProductModal, type ProductFormValues } from "@/components/products/product-modal"
import { createProduct, updateProduct, deleteProduct } from "./actions"

export default function ProductsClient({
  locale,
  rows,
  userRole,
}: {
  locale: string
  rows: ProductRow[]
  userRole: string
}) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"create" | "edit">("create")
  const [editing, setEditing] = React.useState<ProductRow | null>(null)

  const isViewer = userRole === 'VIEWER'

  const labels = {
    title: locale === "fr" ? "Produits" : "Products",
    subtitle:
      locale === "fr"
        ? "Gérez votre catalogue (SKU, code-barres, unité)."
        : "Manage your catalog (SKU, barcode, unit).",

    createTitle: locale === "fr" ? "Créer un produit" : "Create product",
    editTitle: locale === "fr" ? "Modifier le produit" : "Edit product",

    sku: "SKU",
    name: locale === "fr" ? "Nom" : "Name",
    barcode: locale === "fr" ? "Code-barres" : "Barcode",
    unit: locale === "fr" ? "Unité" : "Unit",

    cancel: locale === "fr" ? "Annuler" : "Cancel",
    create: locale === "fr" ? "Créer" : "Create",
    save: locale === "fr" ? "Enregistrer" : "Save",
    new: locale === "fr" ? "Nouveau" : "New",
    deleteConfirm:
      locale === "fr" ? "Supprimer ce produit ?" : "Delete this product?",
    errorGeneric:
      locale === "fr" ? "Une erreur est survenue" : "Something went wrong",
  }

  function openCreate() {
    setMode("create")
    setEditing(null)
    setOpen(true)
  }

  function openEdit(row: ProductRow) {
    setMode("edit")
    setEditing(row)
    setOpen(true)
  }

  async function handleSubmit(values: ProductFormValues) {
    const fd = new FormData()
    fd.set("sku", values.sku)
    fd.set("name", values.name)
    fd.set("barcode", values.barcode)
    fd.set("unit", values.unit)

    if (mode === "create") {
      const res = await createProduct(locale, fd)
      if (!res.ok) throw new Error("message" in res ? res.message : labels.errorGeneric)
      return
    }

    if (!editing) throw new Error("No product selected")
    const res = await updateProduct(locale, editing.id, fd)
    if (!res.ok) throw new Error("message" in res ? res.message : labels.errorGeneric)
  }

  async function handleDelete(row: ProductRow) {
    const ok = window.confirm(`${labels.deleteConfirm}\n\n${row.sku} — ${row.name}`)
    if (!ok) return

    const res = await deleteProduct(locale, row.id)
    if (!res.ok) alert("message" in res ? res.message : labels.errorGeneric)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{labels.title}</h1>
          <p className="text-slate-600 dark:text-slate-400">{labels.subtitle}</p>
        </div>

        {!isViewer && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {labels.new}
          </Button>
        )}
      </div>

      <ProductsTable 
        rows={rows} 
        onEdit={isViewer ? undefined : openEdit} 
        onDelete={isViewer ? undefined : handleDelete} 
      />

      <ProductModal
        open={open}
        mode={mode}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        labels={{
          createTitle: labels.createTitle,
          editTitle: labels.editTitle,
          sku: labels.sku,
          name: labels.name,
          barcode: labels.barcode,
          unit: labels.unit,
          cancel: labels.cancel,
          create: labels.create,
          save: labels.save,
          errorGeneric: labels.errorGeneric,
        }}
        initial={
          mode === "edit" && editing
            ? {
                sku: editing.sku,
                name: editing.name,
                barcode: editing.barcode ?? "",
                unit: editing.unit,
              }
            : { unit: "ea" }
        }
      />
    </div>
  )
}
