import "dotenv/config";
import { db } from "../src/db";
import { services, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Memulai seed database BARBERIN...");

  // =========================
  // SERVICES
  // =========================

  const serviceData = [
    {
      id: "haircut",
      name: "Haircut",
      category: "Potong Rambut",
      price: "30000",
    },
    {
      id: "hair-wash",
      name: "Hair Wash",
      category: "Perawatan",
      price: "20000",
    },
    {
      id: "styling",
      name: "Styling",
      category: "Tata Rambut",
      price: "25000",
    },
    {
      id: "shaving",
      name: "Shaving",
      category: "Cukur",
      price: "15000",
    },
    {
      id: "hair-coloring",
      name: "Hair Coloring",
      category: "Pewarnaan",
      price: "60000",
    },
    {
      id: "beard-trim",
      name: "Beard Trim",
      category: "Cukur",
      price: "15000",
    },
    {
      id: "kids-haircut",
      name: "Kids Haircut",
      category: "Potong Rambut",
      price: "25000",
    },
  ];

  for (const service of serviceData) {
    const existing = await db
      .select()
      .from(services)
      .where(eq(services.id, service.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(services).values(service);
      console.log(`✅ Service dibuat: ${service.name}`);
    } else {
      console.log(`ℹ️ Service sudah ada: ${service.name}`);
    }
  }

  // =========================
  // USERS
  // =========================

  const userData = [
    {
      id: "CUS001",
      name: "Customer Demo",
      email: "customer@barberin.test",
      phone: "081234567890",
      role: "customer" as const,
      capsterRole: null,
      status: "active" as const,
    },
    {
      id: "CAP001",
      name: "Budi",
      email: "budi@barberin.test",
      phone: "081234567891",
      role: "capster" as const,
      capsterRole: "Senior Barber",
      status: "active" as const,
    },
    {
      id: "CAP002",
      name: "Andi",
      email: "andi@barberin.test",
      phone: "081234567892",
      role: "capster" as const,
      capsterRole: "Barber",
      status: "active" as const,
    },
  ];

  for (const user of userData) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values(user);
      console.log(`✅ User dibuat: ${user.name}`);
    } else {
      console.log(`ℹ️ User sudah ada: ${user.name}`);
    }
  }

  console.log("");
  console.log("🎉 Seed BARBERIN selesai!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed gagal:");
  console.error(error);
  process.exit(1);
});