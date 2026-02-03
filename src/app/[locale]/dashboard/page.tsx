import { prisma } from "@/server/db"
import { requireUser } from "@/server/auth"
import { getWarehouses } from "@/server/warehouses"

export default async function DashboardPage() {
  const user = await requireUser()
  
  // Obtener total de productos
  const totalProducts = await prisma.product.count({
    where: {
      OR: [
        { isDemo: false },
        { isDemo: true, expiresAt: { gt: new Date() } }
      ]
    }
  })
  
  // Obtener warehouses disponibles para el usuario
  const warehouses = await getWarehouses()
  
  // Obtener movimientos recientes (últimos 7 días)
  const recentMovements = await prisma.stockMovement.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold dark:text-slate-100">Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400">Welcome to the inventory management system.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 dark:text-slate-100">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 dark:text-slate-100">Warehouses</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{warehouses.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 dark:text-slate-100">Recent Movements (7d)</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{recentMovements}</p>
        </div>
      </div>
    </div>
  )
}
