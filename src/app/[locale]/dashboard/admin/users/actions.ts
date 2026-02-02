'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/server/auth'
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  toggleUserActive, 
  deleteUser 
} from '@/server/users'

type Role = 'ADMIN' | 'STAFF' | 'VIEWER'

export async function getUsersAction() {
  await requireAdmin()
  return getAllUsers()
}

export async function createUserAction(data: {
  email: string
  name: string
  password: string
  role: Role
}) {
  await requireAdmin()
  const user = await createUser(data)
  revalidatePath('/[locale]/dashboard/admin/users')
  return user
}

export async function updateUserAction(id: string, data: {
  name?: string
  email?: string
  role?: Role
  password?: string
}) {
  await requireAdmin()
  const user = await updateUser(id, data)
  revalidatePath('/[locale]/dashboard/admin/users')
  return user
}

export async function toggleUserActiveAction(id: string) {
  await requireAdmin()
  const user = await toggleUserActive(id)
  revalidatePath('/[locale]/dashboard/admin/users')
  return user
}

export async function deleteUserAction(id: string) {
  await requireAdmin()
  await deleteUser(id)
  revalidatePath('/[locale]/dashboard/admin/users')
}
