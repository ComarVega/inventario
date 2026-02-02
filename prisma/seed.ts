import bcrypt from "bcrypt"
import "dotenv/config"
import { db } from "../src/server/db"

console.log("DIRECT_URL:", process.env.DIRECT_URL ? "✅ Loaded" : "❌ Missing")

// Usar db del servidor directamente
const seedDb = db

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 12)

    await seedDb.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", passwordHash: hash },
      create: { email: adminEmail, role: "ADMIN", passwordHash: hash, name: "Admin" },
    })

    console.log(`✅ Admin ensured: ${adminEmail}`)
  } else {
    console.log("ℹ️ ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin seed.")
  }

  // Empresa “única” (si ya existe, la reusa)
  const company = await seedDb.company.upsert({
    where: { name: "Default Company" },
    update: {},
    create: { name: "Default Company" },
  })

  // 4 almacenes por defecto
  const warehouses = [
    { name: "Main", code: "EDM-MAIN" },
    { name: "North", code: "EDM-NORTH" },
    { name: "South", code: "EDM-SOUTH" },
    { name: "Returns", code: "EDM-RETURNS" },
  ] as const

  await seedDb.warehouse.createMany({
    data: warehouses.map((w) => ({
      ...w,
      companyId: company.id,
    })),
    skipDuplicates: true, // si ya existen por code, no truena
  })

  const users = [
    {
      email: "admin@example.com",
      name: "Administrador",
      role: "ADMIN" as const,
      password: "Admin123!",
    },
    {
      email: "staff@example.com",
      name: "Staff Member",
      role: "STAFF" as const,
      password: "Staff123!",
    },
    {
      email: "viewer@example.com",
      name: "Viewer User",
      role: "VIEWER" as const,
      password: "Viewer123!",
    },
  ]

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10)
    await seedDb.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash },
    })
  }

  // Configuración del sistema
  await seedDb.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      systemName: "Inventory System",
      theme: "light",
    },
  })

  console.log("✅ Seed listo:")
  console.log(`- Company: ${company.name}`)
  console.log(`- Warehouses: ${warehouses.map((w) => w.code).join(", ")}`)
  console.log("- Usuarios:")
  for (const u of users) {
    console.log(`  • ${u.email} (${u.role}) / ${u.password}`)
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await seedDb.$disconnect()
  })
