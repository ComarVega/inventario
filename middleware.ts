import { auth } from "@/auth"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Rutas públicas
  const isPublicPath = pathname === "/" || 
                       pathname.includes("/login") || 
                       pathname.includes("/auth/signin") ||
                       pathname.startsWith("/_next") || 
                       pathname.startsWith("/favicon")

  if (isPublicPath) {
    return intlMiddleware(req)
  }

  // Si no hay sesión, redirigir a login
  if (!req.auth) {
    const [, locale = "en"] = pathname.split("/")
    const url = new URL(`/${locale}/login`, req.url)
    url.searchParams.set("next", pathname)
    return Response.redirect(url)
  }

  return intlMiddleware(req)
})

export const runtime = 'nodejs'

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
