import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/server/db"
import bcrypt from "bcrypt"
import { z } from "zod"

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, passwordHash: true, role: true, isActive: true },
        })
        if (!user?.passwordHash) return null
        if (!user.isActive) return null

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null

        // Lo que regresa aquí se convierte en el token JWT
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Cuando el usuario se autentica, agregamos sus datos al token
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session: async ({ session, token }) => {
      // Pasamos los datos del token a la sesión
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "STAFF" | "VIEWER"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
