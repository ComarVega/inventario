'use client'

import { useEffect, useState } from 'react'
import { 
  getUsersAction, 
  createUserAction, 
  updateUserAction, 
  toggleUserActiveAction,
  deleteUserAction 
} from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type User = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  createdAt: Date
}

type UserFormData = {
  email: string
  name: string
  password: string
  role: 'ADMIN' | 'STAFF' | 'VIEWER'
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: 'VIEWER',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getUsersAction()
      setUsers(data)
    } catch (error) {
      toast.error('Error al cargar usuarios')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingUser(null)
    setFormData({ email: '', name: '', password: '', role: 'VIEWER' })
    setDialogOpen(true)
  }

  function openEditDialog(user: User) {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role as 'ADMIN' | 'STAFF' | 'VIEWER',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingUser) {
        const updateData: {
          name: string;
          email: string;
          role: 'ADMIN' | 'STAFF' | 'VIEWER';
          password?: string;
        } = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await updateUserAction(editingUser.id, updateData)
        toast.success('Usuario actualizado')
      } else {
        await createUserAction(formData)
        toast.success('Usuario creado')
      }
      setDialogOpen(false)
      loadUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar usuario'
      toast.error(errorMessage)
    }
  }

  async function handleToggleActive(id: string) {
    try {
      await toggleUserActiveAction(id)
      toast.success('Estado actualizado')
      loadUsers()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      await deleteUserAction(id)
      toast.success('Usuario eliminado')
      loadUsers()
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      STAFF: 'bg-blue-100 text-blue-800',
      VIEWER: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        {role}
      </span>
    )
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Usuarios</h1>
        <Button onClick={openCreateDialog}>+ Crear Usuario</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                    {user.isActive ? 'Activo' : 'Bloqueado'}
                  </span>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(user.id)}
                  >
                    {user.isActive ? 'Bloquear' : 'Activar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Modifica los datos del usuario' 
                : 'Completa el formulario para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">
                Contraseña {editingUser && '(dejar vacío para no cambiar)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as 'ADMIN' | 'STAFF' | 'VIEWER' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="VIEWER">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
