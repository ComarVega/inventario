"use server"

import { z } from "zod"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { AuthError, requireRole } from "@/server/auth"

const CreateProductSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  barcode: z.string().trim().max(128).optional().or(z.literal("")),
  unit: z.string().trim().min(1).max(16).default("ea"),
})

export type CreateProductResult =
  | { ok: true }
  | { ok: false; message: string }

function mapUnique(e: unknown): string | null {
  if (typeof e === "object" && e && "code" in e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = e as any
    if (err.code === "P2002") {
      const target = err?.meta?.target as string[] | undefined
      if (target?.includes("sku")) return "SKU already exists"
      if (target?.includes("barcode")) return "Barcode already exists"
      return "Unique field already exists"
    }
  }
  return null
}

export async function createProductQuick(
  locale: string,
  formData: FormData
): Promise<CreateProductResult> {
  try {
    await requireRole(["ADMIN", "STAFF"])
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, message: e.code === "FORBIDDEN" ? "Not allowed" : "Please sign in" }
    }
    throw e
  }

  const parsed = CreateProductSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    unit: formData.get("unit"),
  })
  if (!parsed.success) return { ok: false, message: "Validation error" }

  const barcode = parsed.data.barcode?.trim() ? parsed.data.barcode.trim() : null

  try {
    await prisma.product.create({
      data: { ...parsed.data, barcode },
    })
    revalidatePath(`/${locale}/dashboard/products`)
    revalidatePath(`/${locale}/dashboard/movements`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: mapUnique(e) ?? "Failed to create product" }
  }
}
