import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

const intlMiddleware = createMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
})

function isProtectedPath(pathname: string) {
  return /^\/(en|fr)\/dashboard(\/.*)?$/.test(pathname)
}

export default auth((req) => {
  // 1) primero i18n (redirects / rewrites)
  const intlResponse = intlMiddleware(req)
  if (intlResponse) return intlResponse

  // 2) luego auth protect
  const { pathname } = req.nextUrl
  if (isProtectedPath(pathname) && !req.auth) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/signin"
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
