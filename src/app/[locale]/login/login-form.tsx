"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  )
}

export function LoginForm({ locale }: { locale: string }) {
  const [state, formAction] = React.useActionState(
    async (_: { message: string | null }, formData: FormData) => {
      const res = await login(locale, formData)
      if (!res || res.ok) return { message: null }
      return { message: (res as { ok: false; message: string }).message }
    },
    { message: null }
  )

  return (
    <form action={formAction} className="space-y-6 rounded-lg border bg-white p-8 shadow-lg max-w-md w-full">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Inventory System</h1>
        <p className="text-sm text-slate-600">Sign in to continue</p>
      </div>

      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" className="h-11" />
      </div>

      <SubmitButton />

      <div className="border-t pt-4">
        <p className="text-xs font-semibold text-slate-700 mb-3">Test Credentials:</p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="font-semibold text-red-600">Admin:</span> admin@example.com / Admin123!
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="font-semibold text-blue-600">Staff:</span> staff@example.com / Staff123!
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="font-semibold text-gray-600">Viewer:</span> viewer@example.com / Viewer123!
          </div>
        </div>
      </div>
    </form>
  )
}
