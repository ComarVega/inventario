"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export type LoginResult = { ok: true } | { ok: false; message: string }

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(4),
})

export async function login(locale: string, formData: FormData): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { ok: false, message: "Invalid credentials" }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid credentials" }
    }
    throw error
  }

  redirect(`/${locale}/dashboard`)
}

export async function logout(locale: string) {
  await signOut({ redirect: false })
  redirect(`/${locale}/login`)
}
