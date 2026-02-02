"use client"

import { LogOut, User as UserIcon } from "lucide-react"
import { logout } from "@/app/[locale]/login/actions"

type User = {
  name: string | null
  email: string | null
  role: string
}

export function UserMenu({ user, locale }: { user: User; locale: string }) {
  const displayName = user.name || user.email || "User"
  const roleLabel = user.role === "ADMIN" ? "Admin" : "Staff"

  return (
    <div className="flex items-center gap-3 border-l pl-4">
      <div className="flex items-center gap-2 text-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
          <UserIcon className="h-4 w-4 text-slate-600" />
        </div>
        <div className="hidden md:block">
          <div className="font-medium text-slate-900">{displayName}</div>
          <div className="text-xs text-slate-500">{roleLabel}</div>
        </div>
      </div>
      
      <button
        onClick={() => logout(locale)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Salir</span>
      </button>
    </div>
  )
}
