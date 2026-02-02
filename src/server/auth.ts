import { auth } from "@/auth"

export type AppRole = "ADMIN" | "STAFF" | "VIEWER"

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  role: AppRole
}

export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN"

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code)
    this.code = code
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role as AppRole,
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw new AuthError("UNAUTHENTICATED")
  return user
}

export async function requireRole(roles: AppRole[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) {
    throw new AuthError("FORBIDDEN")
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(['ADMIN'])
}
