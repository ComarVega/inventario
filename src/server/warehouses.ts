import { cookies } from "next/headers"
import { prisma } from "./db"
import { auth } from "@/auth"


const COOKIE_KEY = "activeWarehouseId"

export async function getWarehouses() {
    const session = await auth()
    
    // Si no hay sesión, devolver vacío
    if (!session?.user?.id) {
        return []
    }
    
    // ADMIN ve todos los warehouses
    if (session.user.role === "ADMIN") {
        return prisma.warehouse.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, code: true },
        })
    }
    
    // STAFF y VIEWER solo ven warehouses asignados
    const userWarehouses = await prisma.userWarehouse.findMany({
        where: { userId: session.user.id },
        include: {
            warehouse: {
                select: { id: true, name: true, code: true }
            }
        },
        orderBy: {
            warehouse: { name: "asc" }
        }
    })
    
    return userWarehouses.map(uw => uw.warehouse)
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