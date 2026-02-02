import { redirect } from "next/navigation"
import { getSession } from "@/server/auth"
import { LoginForm } from "./login-form"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  if (session) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <LoginForm locale={locale} />
      </div>
    </div>
  )
}
