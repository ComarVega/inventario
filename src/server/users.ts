import { db } from './db';
import bcrypt from 'bcrypt';

type Role = 'ADMIN' | 'STAFF' | 'VIEWER';

export async function getAllUsers() {
  return db.user.findMany({
    where: {
      OR: [
        { isDemo: false },
        { isDemo: true, expiresAt: { gt: new Date() } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      isDemo: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  // Marcar como demo si el email contiene 'test', 'demo', o 'example' (excepto admin@example.com)
  const isDemo = (
    (data.email.includes('test') || data.email.includes('demo') || 
     (data.email.includes('example') && data.email !== 'admin@example.com'))
  );
  
  const expiresAt = isDemo ? new Date(Date.now() + 60 * 60 * 1000) : null; // 1 hora
  
  return db.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role,
      isActive: true,
      isDemo,
      expiresAt,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      isDemo: true,
      expiresAt: true,
    },
  });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  role?: Role;
  password?: string;
}) {
  const updateData: {
    name?: string;
    email?: string;
    role?: Role;
    passwordHash?: string;
  } = {};
  
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }
  
  return db.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function toggleUserActive(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  
  return db.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
