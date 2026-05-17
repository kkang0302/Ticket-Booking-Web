require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required to run seed.");
  process.exit(1);
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: passwordHash,
      fullName: "Demo Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      password: passwordHash,
      fullName: "Demo Customer",
      role: "CUSTOMER",
    },
  });

  let concert = await prisma.concert.findFirst({
    where: { title: "Summer Flash Sale Concert" },
    include: { ticketCategories: true },
  });

  if (!concert) {
    concert = await prisma.concert.create({
      data: {
        title: "Summer Flash Sale Concert",
        venue: "National Stadium",
        startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "PUBLISHED",
        ticketCategories: {
          create: [
            {
              name: "VIP",
              price: 150,
              totalQuantity: 50,
              remainingQuantity: 50,
            },
            {
              name: "Standard",
              price: 75,
              totalQuantity: 200,
              remainingQuantity: 200,
            },
          ],
        },
      },
      include: { ticketCategories: true },
    });
  }

  await prisma.voucher.upsert({
    where: { code: "FLASH10" },
    update: { status: "ACTIVE" },
    create: {
      code: "FLASH10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      usageLimit: 100,
      usedCount: 0,
      expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  console.log("Seed complete.");
  console.log("  Admin:    admin@demo.com / password123");
  console.log("  Customer: customer@demo.com / password123");
  console.log("  Concert: ", concert.title, `(id ${concert.id})`);
  console.log("  Voucher:  FLASH10 (10% off)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
