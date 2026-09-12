// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@/src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin@2026", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@leadsdesk.com" },
    update: {}, // no-op if it already exists — won't overwrite an edited admin
    create: {
      name: "Admin",
      email: "admin@leadsdesk.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Seeded admin user: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });