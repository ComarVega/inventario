import { cookies } from "next/headers"
import { prisma } from "./db"


const COOKIE_KEY = "activeWarehouseId"

export async function getWarehouses() {
    // 1 empresa por ahora

    return prisma.warehouse.findMany ({
        orderBy: {name: "asc"},
        select: {id: true, name: true, code: true},
    })
}


export async function getActiveWarehouseId () {
    const c = await cookies()
    return c.get(COOKIE_KEY)?.value ?? null
}


export async function setActiveWarehouseId (id: string) {
    const c = await cookies()
    c.set(COOKIE_KEY, id, {
        httpOnly: true,
        sameSite:"lax",
        path:"/",
    })
}