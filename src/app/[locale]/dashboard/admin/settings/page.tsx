import { requireAdmin } from '@/server/auth'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  await requireAdmin()
  
  return <SettingsClient />
}
