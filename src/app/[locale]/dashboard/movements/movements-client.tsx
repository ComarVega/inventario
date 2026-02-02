"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarcodeScanner } from "@/components/movements/barcode-scanner"
import { applyMovement } from "./actions"
import { MovementsHistory, type MovementHistoryRow } from "@/components/movements/movements-history"
import { ProductModal, type ProductFormValues } from "@/components/products/product-modal"
import { createProductQuick } from "./product-actions"


type Warehouse = { id: string; name: string; code: string }

type MovementTypeUi = "ALL" | "IN" | "OUT" | "ADJUST" | "TRANSFER"
type AdjustMode = "DELTA" | "SET"

type Filters = {
  type: MovementTypeUi
  q: string
  range: "7d" | "30d" | "all"
}

export default function MovementsClient({
  locale,
  warehouses,
  activeWarehouseId,
  history,
  currentFilters,
  userRole,
}: {
  locale: string
  warehouses: Warehouse[]
  activeWarehouseId: string | null
  history: MovementHistoryRow[]
  currentFilters: Filters
  userRole: string
}) {
  const [type, setType] = React.useState<"IN" | "OUT" | "ADJUST" | "TRANSFER">("IN")
  const [barcodeOrSku, setBarcodeOrSku] = React.useState("")
  const [quantity, setQuantity] = React.useState("1")
  const [toWarehouseId, setToWarehouseId] = React.useState<string>("")
  const [note, setNote] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [adjustSign, setAdjustSign] = React.useState<"+" | "-">("+")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [prefillBarcode, setPrefillBarcode] = React.useState("")
  
  const isViewer = userRole === 'VIEWER'
  const [adjustMode, setAdjustMode] = React.useState<AdjustMode>("DELTA")

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filterType, setFilterType] = React.useState<MovementTypeUi>(currentFilters.type)
  const [filterRange, setFilterRange] = React.useState<Filters["range"]>(currentFilters.range)
  const [filterQ, setFilterQ] = React.useState(currentFilters.q)

  function applyFilters() {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("type", filterType)
    sp.set("range", filterRange)
    sp.set("q", filterQ.trim())
    router.push(`${pathname}?${sp.toString()}`)
    router.refresh()
  }

  const wid = activeWarehouseId ?? ""
  
  async function submit() {
    setMsg(null)
    setErr(null)
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("warehouseId", wid)
      fd.set("type", type)
      fd.set("adjustMode", adjustMode)
      fd.set("barcodeOrSku", barcodeOrSku)
      fd.set("prefillBarcode", prefillBarcode)
      const q = Number.parseInt(quantity, 10)
      const signed = type === "ADJUST" ? (adjustSign === "-" ? -Math.abs(q) : Math.abs(q)) : q
      fd.set("quantity", String(signed))
      fd.set("adjustMode", adjustMode)
      if (type !== "ADJUST") setAdjustMode("DELTA")
      if (type === "TRANSFER") fd.set("toWarehouseId", toWarehouseId)
      fd.set("note", note)

      const res = await applyMovement(locale, fd)
      if (!res.ok) {
        if ("code" in res && res.code === "PRODUCT_NOT_FOUND") {
          setErr(
            locale === "fr"
              ? "Produit introuvable (essayez SKU/code-barres). Créez-le dans Products."
              : "Product not found (try SKU/barcode). Create it in Products."
          )
          setPrefillBarcode(barcodeOrSku.trim())
          setCreateOpen(true)
        } else if ("code" in res && res.code === "INSUFFICIENT_STOCK") {
          setErr(locale === "fr" ? "Stock insuffisant." : "Insufficient stock.")
        } else {
          setErr("message" in res ? res.message : "Error")
        }
        return
      }

      setMsg(locale === "fr" ? "Mouvement appliqué." : "Movement applied.")
      setBarcodeOrSku("")
      setNote("")
      setQuantity("1")
      setToWarehouseId("")
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeWarehouseId) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{locale === "fr" ? "Mouvements" : "Movements"}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Sélectionnez un entrepôt en haut à droite."
            : "Select a warehouse from the top-right selector."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProductModal
        open={createOpen}
        mode="create"
        onOpenChange={setCreateOpen}
        onSubmit={async (values: ProductFormValues) => {
          const fd = new FormData()
          fd.set("sku", values.sku)
          fd.set("name", values.name)
          fd.set("barcode", values.barcode)
          fd.set("unit", values.unit)

          const res = await createProductQuick(locale, fd)
          if (!res.ok && "message" in res) throw new Error(res.message)

          // Al crear producto, dejamos el barcode en el input para aplicar movimiento rápido
          setBarcodeOrSku(values.barcode)
        }}
        labels={{
          createTitle: locale === "fr" ? "Créer un produit" : "Create product",
          editTitle: locale === "fr" ? "Modifier le produit" : "Edit product",
          sku: "SKU",
          name: locale === "fr" ? "Nom" : "Name",
          barcode: locale === "fr" ? "Code-barres" : "Barcode",
          unit: locale === "fr" ? "Unité" : "Unit",
          cancel: locale === "fr" ? "Annuler" : "Cancel",
          create: locale === "fr" ? "Créer" : "Create",
          save: locale === "fr" ? "Enregistrer" : "Save",
          errorGeneric: locale === "fr" ? "Une erreur est survenue" : "Something went wrong",
        }}
        initial={{
          barcode: prefillBarcode,
          unit: "ea",
          sku: "",
          name: "",
        }}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{locale === "fr" ? "Mouvements" : "Movements"}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Entrées / sorties / ajustements / transferts, avec scan code-barres."
            : "IN / OUT / ADJUST / TRANSFER with barcode scan."}
        </p>
      </div>

      {msg ? (
        <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-300">{msg}</div>
      ) : null}
      {err ? (
        <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">{err}</div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as MovementTypeUi)}>
              <SelectTrigger className="w-45"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
                <SelectItem value="ADJUST">ADJUST</SelectItem>
                <SelectItem value="TRANSFER">TRANSFER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Range</Label>
            <Select value={filterRange} onValueChange={(v) => setFilterRange(v as Filters["range"])}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Search</Label>
            <Input value={filterQ} onChange={(e) => setFilterQ(e.target.value)} className="w-65" />
          </div>

          <Button type="button" variant="outline" onClick={applyFilters}>
            Apply filters
          </Button>

          <Button
            type="button"
            variant="outline"
            asChild
            disabled={!activeWarehouseId}
          >
            <a
              href={`/api/export/movements?warehouseId=${encodeURIComponent(activeWarehouseId ?? "")}&type=${encodeURIComponent(filterType)}&q=${encodeURIComponent(filterQ.trim())}`}
            >
              Export CSV
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            asChild
            disabled={!activeWarehouseId}
          >
            <a
              href={`/api/export/movements-pdf?warehouseId=${encodeURIComponent(activeWarehouseId ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Export PDF
            </a>
          </Button>
        </div>
      </div>
      
      {isViewer ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Como usuario con rol VIEWER, solo puedes consultar el historial de movimientos.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
            <div className="grid gap-2">
              <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
                <SelectItem value="ADJUST">ADJUST (+)</SelectItem>
                <SelectItem value="TRANSFER">TRANSFER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "ADJUST" ? (
            <div className="grid gap-2">
              <Label>Adjust mode</Label>
              <Select value={adjustMode} onValueChange={(v) => setAdjustMode(v as AdjustMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELTA">Delta (+ / -)</SelectItem>
                  <SelectItem value="SET">Set exact stock</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SET: quantity means final stock. DELTA: quantity means change.
              </p>
            </div>
          ) : null}

          {type === "TRANSFER" ? (
            <div className="grid gap-2">
              <Label>To warehouse</Label>
              <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses
                    .filter((w) => w.id !== activeWarehouseId)
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Barcode or SKU</Label>
            <Input value={barcodeOrSku} onChange={(e) => setBarcodeOrSku(e.target.value)} placeholder="Scan or type..." />
          </div>

          
          {type === "ADJUST" ? (
            <div className="grid gap-2">
              <Label>Adjust</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustSign === "+" ? "default" : "outline"}
                  onClick={() => setAdjustSign("+")}
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant={adjustSign === "-" ? "default" : "outline"}
                  onClick={() => setAdjustSign("-")}
                >
                  -
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={submit} disabled={submitting || !barcodeOrSku.trim()}>
              Apply
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <BarcodeScanner
            onDetected={(value) => {
              setBarcodeOrSku(value)
            }}
          />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Tip: if camera scan fails, type the barcode/SKU manually.
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent movements</h2>
            <MovementsHistory rows={history} />
          </div>

        </div>
      </div>
      )}
    </div>
  )
}
