import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  console.log("Creando usuarios...");
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

  // ========================================
  // 2. CREAR MARCAS
  // ========================================
  console.log("Creando marcas...");

  const dell = await prisma.brand.upsert({
    where: { name: "Dell" },
    update: {},
    create: {
      name: "Dell",
      description: "Tecnología y computadoras de alto rendimiento",
    },
  });

  const hp = await prisma.brand.upsert({
    where: { name: "HP" },
    update: {},
    create: {
      name: "HP",
      description: "Hardware y software empresarial",
    },
  });

  const lenovo = await prisma.brand.upsert({
    where: { name: "Lenovo" },
    update: {},
    create: {
      name: "Lenovo",
      description: "Dispositivos y soluciones tecnológicas",
    },
  });

  const canon = await prisma.brand.upsert({
    where: { name: "Canon" },
    update: {},
    create: {
      name: "Canon",
      description: "Impresoras y equipos de oficina",
    },
  });

  const microsoft = await prisma.brand.upsert({
    where: { name: "Microsoft" },
    update: {},
    create: {
      name: "Microsoft",
      description: "Software y servicios en la nube",
    },
  });

  const logitech = await prisma.brand.upsert({
    where: { name: "Logitech" },
    update: {},
    create: {
      name: "Logitech",
      description: "Periféricos y accesorios informáticos",
    },
  });

  // ========================================
  // 3. CREAR CATEGORÍAS
  // ========================================
  console.log("Creando categorías...");

  const laptops = await prisma.category.upsert({
    where: { name: "Laptops" },
    update: {},
    create: {
      name: "Laptops",
      description: "Computadoras portátiles",
    },
  });

  const monitores = await prisma.category.upsert({
    where: { name: "Monitores" },
    update: {},
    create: {
      name: "Monitores",
      description: "Pantallas y displays",
    },
  });

  const impresoras = await prisma.category.upsert({
    where: { name: "Impresoras" },
    update: {},
    create: {
      name: "Impresoras",
      description: "Equipos de impresión",
    },
  });

  const software = await prisma.category.upsert({
    where: { name: "Software" },
    update: {},
    create: {
      name: "Software",
      description: "Aplicaciones y licencias",
    },
  });

  const perifericos = await prisma.category.upsert({
    where: { name: "Periféricos" },
    update: {},
    create: {
      name: "Periféricos",
      description: "Teclados, mouse y accesorios",
    },
  });

  const electronica = await prisma.category.upsert({
    where: { name: "Electrónica" },
    update: {},
    create: {
      name: "Electrónica",
      description: "Productos electrónicos en general",
    },
  });

  // ========================================
  // 4. CREAR PRODUCTOS
  // ========================================
  console.log("📦 Creando productos...");

  // Producto 1
  const product1 = await prisma.product.upsert({
    where: { sku: "DELL-XPS13-001" },
    update: {},
    create: {
      name: "Laptop Dell XPS 13",
      description: "Laptop ultrabook con procesador Intel i7, 16GB RAM, 512GB SSD",
      sku: "DELL-XPS13-001",
      price: 1299.99,
      stock: 25,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 2
  const product2 = await prisma.product.upsert({
    where: { sku: "HP-MON27-4K" },
    update: {},
    create: {
      name: "Monitor HP 27 4K",
      description: "Monitor 4K de 27 pulgadas con tecnología IPS",
      sku: "HP-MON27-4K",
      price: 399.99,
      stock: 15,
      status: ProductStatus.active,
      brandId: hp.id,
    },
  });

  // Producto 3
  const product3 = await prisma.product.upsert({
    where: { sku: "LEN-T14-AMD" },
    update: {},
    create: {
      name: "ThinkPad Lenovo T14",
      description: "Laptop empresarial con procesador AMD Ryzen 7, 32GB RAM",
      sku: "LEN-T14-AMD",
      price: 1599.99,
      stock: 8,
      status: ProductStatus.active,
      brandId: lenovo.id,
    },
  });

  // Producto 4
  const product4 = await prisma.product.upsert({
    where: { sku: "CAN-PIXMA-001" },
    update: {},
    create: {
      name: "Impresora Canon PIXMA",
      description: "Impresora multifuncional a color con WiFi",
      sku: "CAN-PIXMA-001",
      price: 199.99,
      stock: 0,
      status: ProductStatus.active,
      brandId: canon.id,
    },
  });

  // Producto 5
  const product5 = await prisma.product.upsert({
    where: { sku: "MS-O365-BIZ" },
    update: {},
    create: {
      name: "Office 365 Business",
      description: "Licencia anual de Microsoft Office 365 para empresas",
      sku: "MS-O365-BIZ",
      price: 149.99,
      stock: 100,
      status: ProductStatus.active,
      brandId: microsoft.id,
    },
  });

  // Producto 6
  const product6 = await prisma.product.upsert({
    where: { sku: "LOGI-MX3-001" },
    update: {},
    create: {
      name: "Mouse Logitech MX Master 3",
      description: "Mouse inalámbrico ergonómico con precisión avanzada",
      sku: "LOGI-MX3-001",
      price: 99.99,
      stock: 45,
      status: ProductStatus.active,
      brandId: logitech.id,
    },
  });

  // Producto 7
  const product7 = await prisma.product.upsert({
    where: { sku: "DELL-U2720Q" },
    update: {},
    create: {
      name: "Monitor Dell UltraSharp 27",
      description: "Monitor profesional 4K con USB-C y calibración de fábrica",
      sku: "DELL-U2720Q",
      price: 549.99,
      stock: 12,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 8
  const product8 = await prisma.product.upsert({
    where: { sku: "HP-ENVY-001" },
    update: {},
    create: {
      name: "Laptop HP ENVY 15",
      description: "Laptop creativa con pantalla táctil 4K y GPU dedicada",
      sku: "HP-ENVY-001",
      price: 1799.99,
      stock: 5,
      status: ProductStatus.active,
      brandId: hp.id,
    },
  });

  // Producto 9
  const product9 = await prisma.product.upsert({
    where: { sku: "LOGI-KB-PRO" },
    update: {},
    create: {
      name: "Teclado Logitech MX Keys",
      description: "Teclado inalámbrico retroiluminado para programadores",
      sku: "LOGI-KB-PRO",
      price: 119.99,
      stock: 30,
      status: ProductStatus.inactive,
      brandId: logitech.id,
    },
  });

  // Producto 10
  const product10 = await prisma.product.upsert({
    where: { sku: "CAN-LBP-623" },
    update: {},
    create: {
      name: "Impresora Canon Laser LBP623",
      description: "Impresora láser color de alta velocidad",
      sku: "CAN-LBP-623",
      price: 449.99,
      stock: 3,
      status: ProductStatus.discontinued,
      brandId: canon.id,
    },
  });

  // ========================================
  // 5. CREAR RELACIONES PRODUCTO-CATEGORÍA
  // ========================================
  console.log("Creando relaciones producto-categoría...");

  // Product 1: Laptop Dell XPS 13 → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product1.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product1.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product1.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product1.id,
      categoryId: electronica.id,
    },
  });

  // Product 2: Monitor HP 27 4K → Monitores, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product2.id,
        categoryId: monitores.id,
      },
    },
    update: {},
    create: {
      productId: product2.id,
      categoryId: monitores.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product2.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product2.id,
      categoryId: electronica.id,
    },
  });

  // Product 3: ThinkPad Lenovo T14 → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product3.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product3.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product3.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product3.id,
      categoryId: electronica.id,
    },
  });

  // Product 4: Impresora Canon PIXMA → Impresoras
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product4.id,
        categoryId: impresoras.id,
      },
    },
    update: {},
    create: {
      productId: product4.id,
      categoryId: impresoras.id,
    },
  });

  // Product 5: Office 365 Business → Software
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product5.id,
        categoryId: software.id,
      },
    },
    update: {},
    create: {
      productId: product5.id,
      categoryId: software.id,
    },
  });

  // Product 6: Mouse Logitech MX Master 3 → Periféricos, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product6.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product6.id,
      categoryId: perifericos.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product6.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product6.id,
      categoryId: electronica.id,
    },
  });

  // Product 7: Monitor Dell UltraSharp 27 → Monitores, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product7.id,
        categoryId: monitores.id,
      },
    },
    update: {},
    create: {
      productId: product7.id,
      categoryId: monitores.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product7.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product7.id,
      categoryId: electronica.id,
    },
  });

  // Product 8: Laptop HP ENVY 15 → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product8.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product8.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product8.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product8.id,
      categoryId: electronica.id,
    },
  });

  // Product 9: Teclado Logitech MX Keys → Periféricos, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product9.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product9.id,
      categoryId: perifericos.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product9.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product9.id,
      categoryId: electronica.id,
    },
  });

  // Product 10: Impresora Canon Laser LBP623 → Impresoras
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product10.id,
        categoryId: impresoras.id,
      },
    },
    update: {},
    create: {
      productId: product10.id,
      categoryId: impresoras.id,
    },
  });

  console.log("Seed completado exitosamente!");
  console.log(`   - 2 usuarios creados`);
  console.log(`   - 6 marcas creadas`);
  console.log(`   - 6 categorías creadas`);
  console.log(`   - 10 productos creados`);
  console.log(`   - Relaciones producto-categoría establecidas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
