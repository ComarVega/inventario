import { redirect } from "next/navigation"

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard`)
}