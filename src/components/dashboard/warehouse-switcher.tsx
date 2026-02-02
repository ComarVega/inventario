"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

type Warehouse = { id: string; name: string; code: string }

export function WarehouseSwitcher({
  warehouses,
  activeWarehouseId,
}: {
  warehouses: Warehouse[]
  activeWarehouseId: string | null
}) {
  const router = useRouter()
  const [value, setValue] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  // Evitar hydration mismatch sincronizando después del montaje
  React.useEffect(() => {
    setMounted(true)
    setValue(activeWarehouseId ?? "")
  }, [activeWarehouseId])

  async function onChange(nextId: string) {
    setValue(nextId)
    await fetch("/api/warehouse/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId: nextId }),
    })
    router.refresh()
  }

  // Mostrar placeholder durante SSR para evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="w-65">
        <Select value="" disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="w-65">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select warehouse" />
        </SelectTrigger>
        <SelectContent>
          {warehouses.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name} ({w.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
