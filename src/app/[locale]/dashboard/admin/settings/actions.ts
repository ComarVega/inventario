'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/server/auth'
import { getSystemSettings, updateSystemSettings } from '@/server/system-settings'

export async function getSystemSettingsAction() {
  await requireAdmin()
  return getSystemSettings()
}

export async function updateSystemSettingsAction(data: {
  systemName?: string
  theme?: string
}) {
  await requireAdmin()
  const settings = await updateSystemSettings(data)
  revalidatePath('/[locale]/dashboard/admin/settings')
  revalidatePath('/[locale]/dashboard')
  return settings
}
