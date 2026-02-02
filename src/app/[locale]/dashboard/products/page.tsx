import { listProducts } from "@/server/products"
import { requireUser } from "@/server/auth"
import ProductsClient from "./products-client"

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await requireUser()
  const rows = await listProducts()

  return <ProductsClient locale={locale} rows={rows} userRole={user.role} />
}