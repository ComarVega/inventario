import { requireAdmin } from '@/server/auth'
import UsersClient from './users-client'

export default async function UsersPage() {
  await requireAdmin()
  
  return <UsersClient />
}
