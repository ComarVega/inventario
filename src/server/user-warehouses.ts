import { prisma } from "./db"

export type UserWithWarehouses = {
  id: string
  name: string | null
  email: string | null
  role: string
  warehouseIds: string[]
}

export async function getUsersWithWarehouses(): Promise<UserWithWarehouses[]> {
  const users = await prisma.user.findMany({
    where: {
      isDemo: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      // @ts-expect-error - UserWarehouse relación existe en runtime
      warehouses: {
        select: {
          warehouseId: true
        }
      }
    },
    orderBy: { email: "asc" }
  })
  
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    // @ts-expect-error - warehouses existe en runtime
    warehouseIds: u.warehouses.map(w => w.warehouseId)
  }))
}

export async function assignWarehouseToUser(userId: string, warehouseId: string) {
  // @ts-expect-error - UserWarehouse modelo existe en runtime
  await prisma.userWarehouse.create({
    data: {
      userId,
      warehouseId
    }
  })
}

export async function removeWarehouseFromUser(userId: string, warehouseId: string) {
  // @ts-expect-error - UserWarehouse modelo existe en runtime
  await prisma.userWarehouse.delete({
    where: {
      userId_warehouseId: {
        userId,
        warehouseId
      }
    }
  })
}

export async function setUserWarehouses(userId: string, warehouseIds: string[]) {
  // Eliminar asignaciones existentes
  // @ts-expect-error - UserWarehouse modelo existe en runtime
  await prisma.userWarehouse.deleteMany({
    where: { userId }
  })
  
  // Crear nuevas asignaciones
  if (warehouseIds.length > 0) {
    // @ts-expect-error - UserWarehouse modelo existe en runtime
    await prisma.userWarehouse.createMany({
      data: warehouseIds.map((warehouseId: string) => ({
        userId,
        warehouseId
      }))
    })
  }
}
