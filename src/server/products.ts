import { prisma } from "@/server/db"


export async function listProducts() {
    return prisma.product.findMany({
      where: {
        OR: [
          { isDemo: false },
          { isDemo: true, expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sku:true,
        name: true,
        barcode: true,
        unit: true,
        isDemo: true,
        expiresAt: true,
        updatedAt: true,
        createdAt: true,
        },

    })
    
}



export async function getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku:true,
        name: true,
        barcode: true,
        unit: true,
      },
    })
}