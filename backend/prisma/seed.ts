import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@ltgt.local";
  const supportEmail = "support@ltgt.local";

  const adminPass = await bcrypt.hash("Admin123!", 10);
  const supportPass = await bcrypt.hash("Support123!", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: adminPass,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: supportEmail },
    update: {},
    create: {
      email: supportEmail,
      name: "Support",
      password: supportPass,
      role: Role.SUPPORT,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
