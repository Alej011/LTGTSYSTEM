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

  // Producto 11
  const product11 = await prisma.product.upsert({
    where: { sku: "LOGI-C920-HD" },
    update: {},
    create: {
      name: "Cámara Web Logitech C920",
      description: "Cámara web Full HD 1080p con micrófono estéreo",
      sku: "LOGI-C920-HD",
      price: 79.99,
      stock: 50,
      status: ProductStatus.active,
      brandId: logitech.id,
    },
  });

  // Producto 12
  const product12 = await prisma.product.upsert({
    where: { sku: "DELL-LAT-5420" },
    update: {},
    create: {
      name: "Dell Latitude 5420",
      description: "Laptop empresarial con Intel i5, 16GB RAM, 256GB SSD",
      sku: "DELL-LAT-5420",
      price: 1099.99,
      stock: 18,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 13
  const product13 = await prisma.product.upsert({
    where: { sku: "HP-DESK-600" },
    update: {},
    create: {
      name: "HP ProDesk 600 G6",
      description: "PC de escritorio compacta para oficina, Intel i7, 32GB RAM",
      sku: "HP-DESK-600",
      price: 899.99,
      stock: 10,
      status: ProductStatus.active,
      brandId: hp.id,
    },
  });

  // Producto 14
  const product14 = await prisma.product.upsert({
    where: { sku: "LEN-YOGA-9I" },
    update: {},
    create: {
      name: "Lenovo Yoga 9i",
      description: "Laptop convertible 2-en-1 con pantalla táctil 4K",
      sku: "LEN-YOGA-9I",
      price: 1899.99,
      stock: 6,
      status: ProductStatus.active,
      brandId: lenovo.id,
    },
  });

  // Producto 15
  const product15 = await prisma.product.upsert({
    where: { sku: "MS-SURF-PRO" },
    update: {},
    create: {
      name: "Microsoft Surface Pro 9",
      description: "Tablet profesional con teclado desmontable y stylus",
      sku: "MS-SURF-PRO",
      price: 1299.99,
      stock: 12,
      status: ProductStatus.active,
      brandId: microsoft.id,
    },
  });

  // Producto 16
  const product16 = await prisma.product.upsert({
    where: { sku: "CAN-EOS-R6" },
    update: {},
    create: {
      name: "Canon EOS R6",
      description: "Cámara mirrorless profesional de fotograma completo",
      sku: "CAN-EOS-R6",
      price: 2499.99,
      stock: 4,
      status: ProductStatus.active,
      brandId: canon.id,
    },
  });

  // Producto 17
  const product17 = await prisma.product.upsert({
    where: { sku: "LOGI-G502-HERO" },
    update: {},
    create: {
      name: "Logitech G502 HERO",
      description: "Mouse gaming con sensor de 25K DPI y 11 botones programables",
      sku: "LOGI-G502-HERO",
      price: 59.99,
      stock: 35,
      status: ProductStatus.active,
      brandId: logitech.id,
    },
  });

  // Producto 18
  const product18 = await prisma.product.upsert({
    where: { sku: "DELL-P2422H" },
    update: {},
    create: {
      name: "Monitor Dell P2422H",
      description: "Monitor Full HD de 24 pulgadas para productividad",
      sku: "DELL-P2422H",
      price: 249.99,
      stock: 28,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 19
  const product19 = await prisma.product.upsert({
    where: { sku: "HP-ZBOOK-G8" },
    update: {},
    create: {
      name: "HP ZBook Studio G8",
      description: "Workstation móvil para diseño 3D y edición de video",
      sku: "HP-ZBOOK-G8",
      price: 2299.99,
      stock: 3,
      status: ProductStatus.inactive,
      brandId: hp.id,
    },
  });

  // Producto 20
  const product20 = await prisma.product.upsert({
    where: { sku: "LEN-IDEAPAD-5" },
    update: {},
    create: {
      name: "Lenovo IdeaPad 5",
      description: "Laptop económica para estudiantes, AMD Ryzen 5, 8GB RAM",
      sku: "LEN-IDEAPAD-5",
      price: 649.99,
      stock: 42,
      status: ProductStatus.active,
      brandId: lenovo.id,
    },
  });

  // Producto 21
  const product21 = await prisma.product.upsert({
    where: { sku: "MS-XBOX-CTRL" },
    update: {},
    create: {
      name: "Control Xbox Wireless",
      description: "Control inalámbrico compatible con PC y Xbox",
      sku: "MS-XBOX-CTRL",
      price: 59.99,
      stock: 75,
      status: ProductStatus.active,
      brandId: microsoft.id,
    },
  });

  // Producto 22
  const product22 = await prisma.product.upsert({
    where: { sku: "CAN-SELPHY-1500" },
    update: {},
    create: {
      name: "Canon SELPHY CP1500",
      description: "Impresora fotográfica portátil compacta",
      sku: "CAN-SELPHY-1500",
      price: 129.99,
      stock: 0,
      status: ProductStatus.active,
      brandId: canon.id,
    },
  });

  // Producto 23
  const product23 = await prisma.product.upsert({
    where: { sku: "LOGI-MK850-COMBO" },
    update: {},
    create: {
      name: "Logitech MK850 Performance",
      description: "Combo de teclado y mouse inalámbrico",
      sku: "LOGI-MK850-COMBO",
      price: 99.99,
      stock: 22,
      status: ProductStatus.active,
      brandId: logitech.id,
    },
  });

  // Producto 24
  const product24 = await prisma.product.upsert({
    where: { sku: "DELL-OPTIPLEX-7090" },
    update: {},
    create: {
      name: "Dell OptiPlex 7090",
      description: "Desktop empresarial ultra compacto",
      sku: "DELL-OPTIPLEX-7090",
      price: 1199.99,
      stock: 14,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 25
  const product25 = await prisma.product.upsert({
    where: { sku: "HP-LASERJET-M455" },
    update: {},
    create: {
      name: "HP LaserJet Pro M455dn",
      description: "Impresora láser color con impresión dúplex automática",
      sku: "HP-LASERJET-M455",
      price: 529.99,
      stock: 8,
      status: ProductStatus.active,
      brandId: hp.id,
    },
  });

  // Producto 26
  const product26 = await prisma.product.upsert({
    where: { sku: "LEN-LEGION-5" },
    update: {},
    create: {
      name: "Lenovo Legion 5 Gaming",
      description: "Laptop gaming con RTX 3060, AMD Ryzen 7, 16GB RAM",
      sku: "LEN-LEGION-5",
      price: 1499.99,
      stock: 9,
      status: ProductStatus.active,
      brandId: lenovo.id,
    },
  });

  // Producto 27
  const product27 = await prisma.product.upsert({
    where: { sku: "MS-TEAMS-ROOMS" },
    update: {},
    create: {
      name: "Microsoft Teams Rooms License",
      description: "Licencia para salas de conferencia con Microsoft Teams",
      sku: "MS-TEAMS-ROOMS",
      price: 299.99,
      stock: 50,
      status: ProductStatus.active,
      brandId: microsoft.id,
    },
  });

  // Producto 28
  const product28 = await prisma.product.upsert({
    where: { sku: "LOGI-BRIO-4K" },
    update: {},
    create: {
      name: "Logitech BRIO 4K",
      description: "Cámara web Ultra HD 4K con HDR y Windows Hello",
      sku: "LOGI-BRIO-4K",
      price: 199.99,
      stock: 17,
      status: ProductStatus.active,
      brandId: logitech.id,
    },
  });

  // Producto 29
  const product29 = await prisma.product.upsert({
    where: { sku: "DELL-S2722DC" },
    update: {},
    create: {
      name: "Monitor Dell S2722DC",
      description: "Monitor QHD de 27 pulgadas con USB-C",
      sku: "DELL-S2722DC",
      price: 449.99,
      stock: 11,
      status: ProductStatus.active,
      brandId: dell.id,
    },
  });

  // Producto 30
  const product30 = await prisma.product.upsert({
    where: { sku: "HP-OMEN-17" },
    update: {},
    create: {
      name: "HP OMEN 17",
      description: "Laptop gaming de alto rendimiento con RTX 4070",
      sku: "HP-OMEN-17",
      price: 2199.99,
      stock: 5,
      status: ProductStatus.active,
      brandId: hp.id,
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

  // Product 11: Cámara Web Logitech C920 → Periféricos
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product11.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product11.id,
      categoryId: perifericos.id,
    },
  });

  // Product 12: Dell Latitude 5420 → Laptops
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product12.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product12.id,
      categoryId: laptops.id,
    },
  });

  // Product 13: HP ProDesk 600 G6 → Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product13.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product13.id,
      categoryId: electronica.id,
    },
  });

  // Product 14: Lenovo Yoga 9i → Laptops
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product14.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product14.id,
      categoryId: laptops.id,
    },
  });

  // Product 15: Microsoft Surface Pro 9 → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product15.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product15.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product15.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product15.id,
      categoryId: electronica.id,
    },
  });

  // Product 16: Canon EOS R6 → Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product16.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product16.id,
      categoryId: electronica.id,
    },
  });

  // Product 17: Logitech G502 HERO → Periféricos
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product17.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product17.id,
      categoryId: perifericos.id,
    },
  });

  // Product 18: Monitor Dell P2422H → Monitores
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product18.id,
        categoryId: monitores.id,
      },
    },
    update: {},
    create: {
      productId: product18.id,
      categoryId: monitores.id,
    },
  });

  // Product 19: HP ZBook Studio G8 → Laptops
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product19.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product19.id,
      categoryId: laptops.id,
    },
  });

  // Product 20: Lenovo IdeaPad 5 → Laptops
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product20.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product20.id,
      categoryId: laptops.id,
    },
  });

  // Product 21: Control Xbox Wireless → Periféricos
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product21.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product21.id,
      categoryId: perifericos.id,
    },
  });

  // Product 22: Canon SELPHY CP1500 → Impresoras
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product22.id,
        categoryId: impresoras.id,
      },
    },
    update: {},
    create: {
      productId: product22.id,
      categoryId: impresoras.id,
    },
  });

  // Product 23: Logitech MK850 Performance → Periféricos
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product23.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product23.id,
      categoryId: perifericos.id,
    },
  });

  // Product 24: Dell OptiPlex 7090 → Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product24.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product24.id,
      categoryId: electronica.id,
    },
  });

  // Product 25: HP LaserJet Pro M455dn → Impresoras
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product25.id,
        categoryId: impresoras.id,
      },
    },
    update: {},
    create: {
      productId: product25.id,
      categoryId: impresoras.id,
    },
  });

  // Product 26: Lenovo Legion 5 Gaming → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product26.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product26.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product26.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product26.id,
      categoryId: electronica.id,
    },
  });

  // Product 27: Microsoft Teams Rooms License → Software
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product27.id,
        categoryId: software.id,
      },
    },
    update: {},
    create: {
      productId: product27.id,
      categoryId: software.id,
    },
  });

  // Product 28: Logitech BRIO 4K → Periféricos
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product28.id,
        categoryId: perifericos.id,
      },
    },
    update: {},
    create: {
      productId: product28.id,
      categoryId: perifericos.id,
    },
  });

  // Product 29: Monitor Dell S2722DC → Monitores
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product29.id,
        categoryId: monitores.id,
      },
    },
    update: {},
    create: {
      productId: product29.id,
      categoryId: monitores.id,
    },
  });

  // Product 30: HP OMEN 17 → Laptops, Electrónica
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product30.id,
        categoryId: laptops.id,
      },
    },
    update: {},
    create: {
      productId: product30.id,
      categoryId: laptops.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product30.id,
        categoryId: electronica.id,
      },
    },
    update: {},
    create: {
      productId: product30.id,
      categoryId: electronica.id,
    },
  });

  console.log("Seed completado exitosamente!");
  console.log(`   - 2 usuarios creados`);
  console.log(`   - 6 marcas creadas`);
  console.log(`   - 6 categorías creadas`);
  console.log(`   - 30 productos creados`);
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
