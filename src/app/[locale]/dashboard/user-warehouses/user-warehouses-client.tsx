"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { UserWithWarehouses } from "@/server/user-warehouses"
import { assignWarehouses } from "./actions"

type Warehouse = {
  id: string
  name: string
  code: string
}

export default function UserWarehousesClient({
  locale,
  users,
  warehouses,
}: {
  locale: string
  users: UserWithWarehouses[]
  warehouses: Warehouse[]
}) {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
  const [selectedWarehouses, setSelectedWarehouses] = React.useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = React.useState(false)

  const selectedUser = users.find(u => u.id === selectedUserId)

  React.useEffect(() => {
    if (selectedUser) {
      setSelectedWarehouses(new Set(selectedUser.warehouseIds))
    }
  }, [selectedUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId) return

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("userId", selectedUserId)
      selectedWarehouses.forEach(id => fd.append("warehouseIds", id))

      const res = await assignWarehouses(locale, fd)
      if (!res.ok) {
        alert(res.message)
      } else {
        alert(locale === "fr" ? "Assignations mises à jour" : "Assignments updated")
        setSelectedUserId(null)
      }
    } finally {
      setSubmitting(false)
    }
  }

  function toggleWarehouse(warehouseId: string) {
    const newSet = new Set(selectedWarehouses)
    if (newSet.has(warehouseId)) {
      newSet.delete(warehouseId)
    } else {
      newSet.add(warehouseId)
    }
    setSelectedWarehouses(newSet)
  }

  const labels = {
    title: locale === "fr" ? "Assigner Entrepôts aux Utilisateurs" : "Assign Warehouses to Users",
    subtitle: locale === "fr" ? "Gérer l'accès des utilisateurs aux entrepôts" : "Manage user access to warehouses",
    selectUser: locale === "fr" ? "Sélectionner un utilisateur" : "Select a user",
    warehouses: locale === "fr" ? "Entrepôts" : "Warehouses",
    save: locale === "fr" ? "Enregistrer" : "Save",
    cancel: locale === "fr" ? "Annuler" : "Cancel",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{labels.title}</h1>
        <p className="text-slate-600 dark:text-slate-400">{labels.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lista de usuarios */}
        <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
          <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">{labels.selectUser}</h2>
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left px-3 py-2 rounded border transition ${
                  selectedUserId === user.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600"
                    : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                }`}
              >
                <div className="font-medium text-slate-900 dark:text-slate-100">{user.email}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {user.role} • {user.warehouseIds.length} {locale === "fr" ? "entrepôt(s)" : "warehouse(s)"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de asignación */}
        <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
          {selectedUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">
                  {selectedUser.email}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.role}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{labels.warehouses}</label>
                {warehouses.map(warehouse => (
                  <label
                    key={warehouse.id}
                    className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWarehouses.has(warehouse.id)}
                      onChange={() => toggleWarehouse(warehouse.id)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-slate-900 dark:text-slate-100">
                      {warehouse.name} ({warehouse.code})
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {labels.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                  disabled={submitting}
                >
                  {labels.cancel}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {locale === "fr" ? "Sélectionnez un utilisateur pour gérer ses entrepôts" : "Select a user to manage their warehouses"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
