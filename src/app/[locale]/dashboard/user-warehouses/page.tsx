import { requireAdmin } from "@/server/auth"
import { getUsersWithWarehouses } from "@/server/user-warehouses"
import { getWarehouses } from "@/server/warehouses"
import UserWarehousesClient from "./user-warehouses-client"

export default async function UserWarehousesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await requireAdmin() // Solo admin puede acceder
  
  const { locale } = await params
  const [users, allWarehouses] = await Promise.all([
    getUsersWithWarehouses(),
    // Obtener todos los warehouses sin filtrar por usuario
    (async () => {
      const { prisma } = await import("@/server/db")
      return prisma.warehouse.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true }
      })
    })()
  ])

  return (
    <UserWarehousesClient
      locale={locale}
      users={users}
      warehouses={allWarehouses}
    />
  )
}
