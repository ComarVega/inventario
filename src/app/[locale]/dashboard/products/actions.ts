"use server"

import { z } from "zod"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { AuthError, requireRole, requireAdmin } from "@/server/auth"
import { requireStaffOrAdmin } from "@/server/rbac"

const ProductSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required").max(64),
  name: z.string().trim().min(1, "Name is required").max(200),
  barcode: z
    .string()
    .trim()
    .max(128)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : null)),
  unit: z.string().trim().min(1).max(16).default("ea"),
  warehouseId: z.string().optional(),
})

function mapPrismaUniqueError(e: unknown): string | null {
  if (typeof e === "object" && e && "code" in e) {
    // Prisma unique constraint error code
    // P2002 = Unique constraint failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = e as any
    if (anyErr.code === "P2002") {
      const target = anyErr?.meta?.target as string[] | undefined
      if (target?.includes("sku")) return "SKU already exists"
      if (target?.includes("barcode")) return "Barcode already exists"
      return "Unique field already exists"
    }
  }
  return null
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

export async function createProduct(
  locale: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireStaffOrAdmin()
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        ok: false,
        message: e.code === "FORBIDDEN" ? "Not allowed" : "Please sign in",
      }
    }
    throw e
  }

  const parsed = ProductSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    unit: formData.get("unit"),
    warehouseId: formData.get("warehouseId"),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Validation error", fieldErrors }
  }

  try {
    // Marcar como demo si SKU contiene 'test', 'demo' o 'example'
    const isDemo = (
      parsed.data.sku.toLowerCase().includes('test') || 
      parsed.data.sku.toLowerCase().includes('demo') || 
      parsed.data.sku.toLowerCase().includes('example')
    );
    
    const expiresAt = isDemo ? new Date(Date.now() + 60 * 60 * 1000) : null; // 1 hora
    
    const product = await prisma.product.create({ 
      data: { 
        sku: parsed.data.sku,
        name: parsed.data.name,
        barcode: parsed.data.barcode,
        unit: parsed.data.unit,
        isDemo,
        expiresAt 
      } 
    })
    
    // Si se especificó warehouse, crear stock inicial en 0
    if (parsed.data.warehouseId) {
      await prisma.inventoryBalance.create({
        data: {
          productId: product.id,
          warehouseId: parsed.data.warehouseId,
          quantity: 0,
        },
      })
    }
    
    revalidatePath(`/${locale}/dashboard/products`)
    revalidatePath(`/${locale}/dashboard/inventory`)
    return { ok: true }
  } catch (e) {
    const msg = mapPrismaUniqueError(e) ?? "Failed to create product"
    return { ok: false, message: msg }
  }
}

export async function updateProduct(
  locale: string,
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN", "STAFF"])
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        ok: false,
        message: e.code === "FORBIDDEN" ? "Not allowed" : "Please sign in",
      }
    }
    throw e
  }

  const parsed = ProductSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    unit: formData.get("unit"),
    warehouseId: formData.get("warehouseId"),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Validation error", fieldErrors }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        sku: parsed.data.sku,
        name: parsed.data.name,
        barcode: parsed.data.barcode,
        unit: parsed.data.unit,
      },
    })
    
    // Si se especificó un nuevo warehouse, actualizar o crear el balance
    if (parsed.data.warehouseId) {
      await prisma.inventoryBalance.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: parsed.data.warehouseId,
            productId: id
          }
        },
        create: {
          productId: id,
          warehouseId: parsed.data.warehouseId,
          quantity: 0,
        },
        update: {
          // No actualizar nada, solo asegurar que existe
        }
      })
    }
    
    revalidatePath(`/${locale}/dashboard/products`)
    revalidatePath(`/${locale}/dashboard/inventory`)
    return { ok: true }
  } catch (e) {
    const msg = mapPrismaUniqueError(e) ?? "Failed to update product"
    return { ok: false, message: msg }
  }
}

export async function deleteProduct(
  locale: string,
  id: string
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN", "STAFF"])
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        ok: false,
        message: e.code === "FORBIDDEN" ? "Not allowed" : "Please sign in",
      }
    }
    throw e
  }

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath(`/${locale}/dashboard/products`)
    return { ok: true }
  } catch {
    return { ok: false, message: "Failed to delete product" }
  }
}
