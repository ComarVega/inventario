import { NextResponse } from "next/server"
import { setActiveWarehouseId } from "@/server/warehouses"


export async function POST(req: Request) {
    const body = (await req.json().catch(() => null)) as {warehouseId?: string } | null
    if (!body?.warehouseId) {
        return NextResponse.json({ error: "warehouseId is required"}, {status: 400})
        
    }

    await setActiveWarehouseId(body.warehouseId)
    return NextResponse.json({ok: true })
}