import { listProducts } from "@/server/products"
import { requireUser } from "@/server/auth"
import { getWarehouses, getActiveWarehouseId } from "@/server/warehouses"
import ProductsClient from "./products-client"

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await requireUser()
  const activeWarehouseId = await getActiveWarehouseId()
  const rows = await listProducts(user.id, user.role, activeWarehouseId ?? undefined)
  const warehouses = await getWarehouses()

  return (
    <ProductsClient 
      locale={locale} 
      rows={rows} 
      userRole={user.role}
      warehouses={warehouses.map(w => ({ id: w.id, name: w.name }))}
      currentWarehouseId={activeWarehouseId ?? undefined}
    />
  )
}