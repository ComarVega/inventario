'use client'

import { useEffect, useState } from 'react'
import { getSystemSettingsAction, updateSystemSettingsAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function SettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemName, setSystemName] = useState('')
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const data = await getSystemSettingsAction()
      setSystemName(data.systemName)
      setTheme(data.theme)
    } catch (error) {
      toast.error('Error al cargar configuración')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      await updateSystemSettingsAction({ systemName, theme })
      toast.success('Configuración actualizada')
      window.location.reload() // Reload para aplicar cambios
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar configuración'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Configuración del Sistema</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="systemName">Nombre del Sistema</Label>
          <Input
            id="systemName"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="Inventory System"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Este nombre se mostrará en el encabezado del sistema
          </p>
        </div>

        <div>
          <Label htmlFor="theme">Tema</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona el tema del sistema
          </p>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </form>
    </div>
  )
}
