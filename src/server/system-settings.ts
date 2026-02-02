import { db } from './db';

export async function getSystemSettings() {
  const settings = await db.systemSettings.findUnique({
    where: { id: 'default' },
  });
  
  return settings || {
    id: 'default',
    systemName: 'Inventory System',
    theme: 'light',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateSystemSettings(data: {
  systemName?: string;
  theme?: string;
}) {
  return db.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      id: 'default',
      systemName: data.systemName || 'Inventory System',
      theme: data.theme || 'light',
    },
  });
}
