import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';
import { brands, categories, products } from './seed-data';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedUser = { email: string; password: string; name: string; role: Role };

function userFromEnv(prefix: 'ADMIN' | 'SUPPORT', role: Role, required: boolean): SeedUser | null {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  const name = process.env[`${prefix}_NAME`];

  if (!email || !password || !name) {
    if (required) {
      throw new Error(`Faltan ${prefix}_EMAIL, ${prefix}_PASSWORD o ${prefix}_NAME en el entorno`);
    }
    return null;
  }
  if (password.length < 8) {
    throw new Error(`${prefix}_PASSWORD debe tener al menos 8 caracteres`);
  }
  return { email, password, name, role };
}

async function seedUsers() {
  const users = [
    userFromEnv('ADMIN', Role.ADMIN, true),
    userFromEnv('SUPPORT', Role.SUPPORT, false),
  ].filter((user): user is SeedUser => user !== null);

  // update vacío: no sobrescribe contraseñas de usuarios ya existentes
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: await bcrypt.hash(user.password, 10) },
    });
  }
  return users.length;
}

async function seedCatalog() {
  const brandIds = new Map<string, string>();
  for (const brand of brands) {
    const { id } = await prisma.brand.upsert({ where: { name: brand.name }, update: {}, create: brand });
    brandIds.set(brand.name, id);
  }

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const { id } = await prisma.category.upsert({ where: { name: category.name }, update: {}, create: category });
    categoryIds.set(category.name, id);
  }

  for (const { brand, categories: productCategories, ...product } of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        brand: { connect: { id: brandIds.get(brand) } },
        categories: {
          create: productCategories.map((name) => ({ category: { connect: { id: categoryIds.get(name) } } })),
        },
      },
    });
  }
}

async function main() {
  const userCount = await seedUsers();
  await seedCatalog();
  console.log(
    `Seed completado: ${userCount} usuarios, ${brands.length} marcas, ${categories.length} categorías, ${products.length} productos`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
