"use server"

import { z } from "zod"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { AuthError, requireRole } from "@/server/auth"
import {requireSession } from "@/server/rbac"

const MovementSchema = z.object({
  warehouseId: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUST", "TRANSFER"]),
  barcodeOrSku: z.string().trim().min(1),

  // Para IN/OUT/TRANSFER es qty > 0
  // Para ADJUST delta puede ser +/-
  quantity: z.coerce.number().int(),

  // Ajuste modo:
  // - DELTA: quantity es signed (+/-)
  // - SET: quantity es el stock final deseado (>= 0)
  adjustMode: z.enum(["DELTA", "SET"]).optional(),

  toWarehouseId: z.string().optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
})


function isValidQuantity(type: "IN" | "OUT" | "ADJUST" | "TRANSFER", qty: number) {
  if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty === 0) return false
  if (type === "ADJUST") return true
  return qty > 0
}


export type MovementResult =
  | { ok: true }
  | { ok: false; message: string; code?: "PRODUCT_NOT_FOUND" | "INSUFFICIENT_STOCK" | "INVALID_TRANSFER" }

export async function applyMovement(
  locale: string,
  formData: FormData
): Promise<MovementResult> {
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

  const session = await requireSession()
  const userId = session.user.id

  const parsed = MovementSchema.safeParse({
    warehouseId: formData.get("warehouseId"),
    type: formData.get("type"),
    barcodeOrSku: formData.get("barcodeOrSku"),
    quantity: formData.get("quantity"),
    toWarehouseId: formData.get("toWarehouseId") ?? undefined,
    note: formData.get("note") ?? undefined,
  })

  if (!parsed.success) {
    return { ok: false, message: "Validation error" }
  }

  const { warehouseId, type, barcodeOrSku, quantity, toWarehouseId } = parsed.data
  const adjustMode = parsed.data.adjustMode ?? "DELTA"
  const note = parsed.data.note?.trim() ? parsed.data.note.trim() : null

  if (!isValidQuantity(type, quantity)) {
  return { ok: false, message: "Invalid quantity" }
}


  const product = await prisma.product.findFirst({
    where: {
      OR: [{ barcode: barcodeOrSku }, { sku: barcodeOrSku }],
    },
    select: { id: true },
  })

  if (!product) {
    return { ok: false, message: "Product not found", code: "PRODUCT_NOT_FOUND" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const pid = product.id

      if (type === "TRANSFER") {
        if (!toWarehouseId || toWarehouseId === warehouseId) {
          throw new Error("INVALID_TRANSFER")
        }

        const fromBal = await tx.inventoryBalance.upsert({
          where: { productId_warehouseId: { productId: pid, warehouseId } },
          update: {},
          create: { productId: pid, warehouseId, quantity: 0 },
          select: { quantity: true },
        })

        if (fromBal.quantity < quantity) {
          throw new Error("INSUFFICIENT_STOCK")
        }

        await tx.inventoryBalance.update({
          where: { productId_warehouseId: { productId: pid, warehouseId } },
          data: { quantity: { decrement: quantity } },
        })

        await tx.inventoryBalance.upsert({
          where: { productId_warehouseId: { productId: pid, warehouseId: toWarehouseId } },
          update: { quantity: { increment: quantity } },
          create: { productId: pid, warehouseId: toWarehouseId, quantity },
        })

        await tx.stockMovement.create({
          data: {
            type: "TRANSFER",
            quantity,
            note,
            createdByUserId: userId,
            productId: pid,
            fromWarehouseId: warehouseId,
            toWarehouseId,
          },
        })

        return
      }

      // Non-transfer: affects one warehouse
      const bal = await tx.inventoryBalance.upsert({
        where: { productId_warehouseId: { productId: pid, warehouseId } },
        update: {},
        create: { productId: pid, warehouseId, quantity: 0 },
        select: { quantity: true },
      })

      if (type === "OUT") {
        if (bal.quantity < quantity) {
          throw new Error("INSUFFICIENT_STOCK")
        }
        await tx.inventoryBalance.update({
          where: { productId_warehouseId: { productId: pid, warehouseId } },
          data: { quantity: { decrement: quantity } },
        })
        await tx.stockMovement.create({
          data: { type: "OUT", quantity, note, createdByUserId: userId, productId: pid, fromWarehouseId: warehouseId },
        })
        return
      }

      if (type === "IN") {
        await tx.inventoryBalance.update({
          where: { productId_warehouseId: { productId: pid, warehouseId } },
          data: { quantity: { increment: quantity } },
        })
        await tx.stockMovement.create({
          data: { type: "IN", quantity, note, createdByUserId: userId, productId: pid, toWarehouseId: warehouseId },
        })
        return
      }

      // ADJUST: set delta (+/-) not allowed negative by schema here; we treat quantity as absolute delta to add.
if (type === "ADJUST") {
  const bal = await tx.inventoryBalance.upsert({
    where: { productId_warehouseId: { productId: pid, warehouseId } },
    update: {},
    create: { productId: pid, warehouseId, quantity: 0 },
    select: { quantity: true },
  })

  // Si SET, quantity = stock final deseado
  // Si DELTA, quantity = delta signed
  const delta =
    adjustMode === "SET"
      ? quantity - bal.quantity
      : quantity

  // En SET, no permitimos negativo final (delta puede ser negativo, pero final no)
  // En DELTA, tampoco dejamos que quede negativo
  if (delta < 0 && bal.quantity < Math.abs(delta)) {
    throw new Error("INSUFFICIENT_STOCK")
  }

  // aplica delta
  await tx.inventoryBalance.update({
    where: { productId_warehouseId: { productId: pid, warehouseId } },
    data:
      delta > 0
        ? { quantity: { increment: delta } }
        : { quantity: { decrement: Math.abs(delta) } },
  })

  const extra =
    adjustMode === "SET"
      ? `SET to ${quantity} (delta ${delta})`
      : null

  await tx.stockMovement.create({
    data: {
      type: "ADJUST",
      quantity: delta,               // guardamos el delta real
      note: [note, extra].filter(Boolean).join(" | ") || null,
      createdByUserId: userId,
      productId: pid,
      toWarehouseId: warehouseId,
    },
  })
  return
}
})

    revalidatePath(`/${locale}/dashboard/movements`)
    revalidatePath(`/${locale}/dashboard/inventory`)
    return { ok: true }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "INSUFFICIENT_STOCK") {
        return { ok: false, message: "Insufficient stock", code: "INSUFFICIENT_STOCK" }
      }
      if (e.message === "INVALID_TRANSFER") {
        return { ok: false, message: "Invalid transfer", code: "INVALID_TRANSFER" }
      }
    }
    return { ok: false, message: "Failed to apply movement" }
  }
}