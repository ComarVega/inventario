"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/server/auth"
import { setUserWarehouses } from "@/server/user-warehouses"

const AssignWarehousesSchema = z.object({
  userId: z.string(),
  warehouseIds: z.array(z.string())
})

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string }

export async function assignWarehouses(
  locale: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, message: "Not allowed - Admin only" }
  }

  const userId = formData.get("userId") as string
  const warehouseIds = formData.getAll("warehouseIds") as string[]

  const parsed = AssignWarehousesSchema.safeParse({ userId, warehouseIds })
  
  if (!parsed.success) {
    return { ok: false, message: "Invalid data" }
  }

  try {
    await setUserWarehouses(parsed.data.userId, parsed.data.warehouseIds)
    revalidatePath(`/${locale}/dashboard/user-warehouses`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed to assign warehouses" }
  }
}
