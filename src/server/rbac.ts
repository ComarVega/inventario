import { auth } from "@/auth"

export async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error("UNAUTHORIZED")
  return session
}

export async function requireAdmin() {
  const session = await requireSession()
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN")
  return session
}
