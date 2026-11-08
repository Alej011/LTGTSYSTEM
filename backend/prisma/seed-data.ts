import { ProductStatus } from '../src/generated/prisma/enums';

export type SeedProduct = {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  brand: string;
  categories: string[];
};

export const brands = [
  { name: 'Dell', description: 'Tecnología y computadoras de alto rendimiento' },
  { name: 'HP', description: 'Hardware y software empresarial' },
  { name: 'Lenovo', description: 'Dispositivos y soluciones tecnológicas' },
  { name: 'Canon', description: 'Impresoras y equipos de oficina' },
  { name: 'Microsoft', description: 'Software y servicios en la nube' },
  { name: 'Logitech', description: 'Periféricos y accesorios informáticos' },
];

export const categories = [
  { name: 'Laptops', description: 'Computadoras portátiles' },
  { name: 'Monitores', description: 'Pantallas y displays' },
  { name: 'Impresoras', description: 'Equipos de impresión' },
  { name: 'Software', description: 'Aplicaciones y licencias' },
  { name: 'Periféricos', description: 'Teclados, mouse y accesorios' },
  { name: 'Electrónica', description: 'Productos electrónicos en general' },
];

const { active, inactive, discontinued } = ProductStatus;

export const products: SeedProduct[] = [
  { sku: 'DELL-XPS13-001', name: 'Laptop Dell XPS 13', description: 'Laptop ultrabook con procesador Intel i7, 16GB RAM, 512GB SSD', price: 1299.99, stock: 25, status: active, brand: 'Dell', categories: ['Laptops', 'Electrónica'] },
  { sku: 'HP-MON27-4K', name: 'Monitor HP 27 4K', description: 'Monitor 4K de 27 pulgadas con tecnología IPS', price: 399.99, stock: 15, status: active, brand: 'HP', categories: ['Monitores', 'Electrónica'] },
  { sku: 'LEN-T14-AMD', name: 'ThinkPad Lenovo T14', description: 'Laptop empresarial con procesador AMD Ryzen 7, 32GB RAM', price: 1599.99, stock: 8, status: active, brand: 'Lenovo', categories: ['Laptops', 'Electrónica'] },
  { sku: 'CAN-PIXMA-001', name: 'Impresora Canon PIXMA', description: 'Impresora multifuncional a color con WiFi', price: 199.99, stock: 0, status: active, brand: 'Canon', categories: ['Impresoras'] },
  { sku: 'MS-O365-BIZ', name: 'Office 365 Business', description: 'Licencia anual de Microsoft Office 365 para empresas', price: 149.99, stock: 100, status: active, brand: 'Microsoft', categories: ['Software'] },
  { sku: 'LOGI-MX3-001', name: 'Mouse Logitech MX Master 3', description: 'Mouse inalámbrico ergonómico con precisión avanzada', price: 99.99, stock: 45, status: active, brand: 'Logitech', categories: ['Periféricos', 'Electrónica'] },
  { sku: 'DELL-U2720Q', name: 'Monitor Dell UltraSharp 27', description: 'Monitor profesional 4K con USB-C y calibración de fábrica', price: 549.99, stock: 12, status: active, brand: 'Dell', categories: ['Monitores', 'Electrónica'] },
  { sku: 'HP-ENVY-001', name: 'Laptop HP ENVY 15', description: 'Laptop creativa con pantalla táctil 4K y GPU dedicada', price: 1799.99, stock: 5, status: active, brand: 'HP', categories: ['Laptops', 'Electrónica'] },
  { sku: 'LOGI-KB-PRO', name: 'Teclado Logitech MX Keys', description: 'Teclado inalámbrico retroiluminado para programadores', price: 119.99, stock: 30, status: inactive, brand: 'Logitech', categories: ['Periféricos', 'Electrónica'] },
  { sku: 'CAN-LBP-623', name: 'Impresora Canon Laser LBP623', description: 'Impresora láser color de alta velocidad', price: 449.99, stock: 3, status: discontinued, brand: 'Canon', categories: ['Impresoras'] },
  { sku: 'LOGI-C920-HD', name: 'Cámara Web Logitech C920', description: 'Cámara web Full HD 1080p con micrófono estéreo', price: 79.99, stock: 50, status: active, brand: 'Logitech', categories: ['Periféricos'] },
  { sku: 'DELL-LAT-5420', name: 'Dell Latitude 5420', description: 'Laptop empresarial con Intel i5, 16GB RAM, 256GB SSD', price: 1099.99, stock: 18, status: active, brand: 'Dell', categories: ['Laptops'] },
  { sku: 'HP-DESK-600', name: 'HP ProDesk 600 G6', description: 'PC de escritorio compacta para oficina, Intel i7, 32GB RAM', price: 899.99, stock: 10, status: active, brand: 'HP', categories: ['Electrónica'] },
  { sku: 'LEN-YOGA-9I', name: 'Lenovo Yoga 9i', description: 'Laptop convertible 2-en-1 con pantalla táctil 4K', price: 1899.99, stock: 6, status: active, brand: 'Lenovo', categories: ['Laptops'] },
  { sku: 'MS-SURF-PRO', name: 'Microsoft Surface Pro 9', description: 'Tablet profesional con teclado desmontable y stylus', price: 1299.99, stock: 12, status: active, brand: 'Microsoft', categories: ['Laptops', 'Electrónica'] },
  { sku: 'CAN-EOS-R6', name: 'Canon EOS R6', description: 'Cámara mirrorless profesional de fotograma completo', price: 2499.99, stock: 4, status: active, brand: 'Canon', categories: ['Electrónica'] },
  { sku: 'LOGI-G502-HERO', name: 'Logitech G502 HERO', description: 'Mouse gaming con sensor de 25K DPI y 11 botones programables', price: 59.99, stock: 35, status: active, brand: 'Logitech', categories: ['Periféricos'] },
  { sku: 'DELL-P2422H', name: 'Monitor Dell P2422H', description: 'Monitor Full HD de 24 pulgadas para productividad', price: 249.99, stock: 28, status: active, brand: 'Dell', categories: ['Monitores'] },
  { sku: 'HP-ZBOOK-G8', name: 'HP ZBook Studio G8', description: 'Workstation móvil para diseño 3D y edición de video', price: 2299.99, stock: 3, status: inactive, brand: 'HP', categories: ['Laptops'] },
  { sku: 'LEN-IDEAPAD-5', name: 'Lenovo IdeaPad 5', description: 'Laptop económica para estudiantes, AMD Ryzen 5, 8GB RAM', price: 649.99, stock: 42, status: active, brand: 'Lenovo', categories: ['Laptops'] },
  { sku: 'MS-XBOX-CTRL', name: 'Control Xbox Wireless', description: 'Control inalámbrico compatible con PC y Xbox', price: 59.99, stock: 75, status: active, brand: 'Microsoft', categories: ['Periféricos'] },
  { sku: 'CAN-SELPHY-1500', name: 'Canon SELPHY CP1500', description: 'Impresora fotográfica portátil compacta', price: 129.99, stock: 0, status: active, brand: 'Canon', categories: ['Impresoras'] },
  { sku: 'LOGI-MK850-COMBO', name: 'Logitech MK850 Performance', description: 'Combo de teclado y mouse inalámbrico', price: 99.99, stock: 22, status: active, brand: 'Logitech', categories: ['Periféricos'] },
  { sku: 'DELL-OPTIPLEX-7090', name: 'Dell OptiPlex 7090', description: 'Desktop empresarial ultra compacto', price: 1199.99, stock: 14, status: active, brand: 'Dell', categories: ['Electrónica'] },
  { sku: 'HP-LASERJET-M455', name: 'HP LaserJet Pro M455dn', description: 'Impresora láser color con impresión dúplex automática', price: 529.99, stock: 8, status: active, brand: 'HP', categories: ['Impresoras'] },
  { sku: 'LEN-LEGION-5', name: 'Lenovo Legion 5 Gaming', description: 'Laptop gaming con RTX 3060, AMD Ryzen 7, 16GB RAM', price: 1499.99, stock: 9, status: active, brand: 'Lenovo', categories: ['Laptops', 'Electrónica'] },
  { sku: 'MS-TEAMS-ROOMS', name: 'Microsoft Teams Rooms License', description: 'Licencia para salas de conferencia con Microsoft Teams', price: 299.99, stock: 50, status: active, brand: 'Microsoft', categories: ['Software'] },
  { sku: 'LOGI-BRIO-4K', name: 'Logitech BRIO 4K', description: 'Cámara web Ultra HD 4K con HDR y Windows Hello', price: 199.99, stock: 17, status: active, brand: 'Logitech', categories: ['Periféricos'] },
  { sku: 'DELL-S2722DC', name: 'Monitor Dell S2722DC', description: 'Monitor QHD de 27 pulgadas con USB-C', price: 449.99, stock: 11, status: active, brand: 'Dell', categories: ['Monitores'] },
  { sku: 'HP-OMEN-17', name: 'HP OMEN 17', description: 'Laptop gaming de alto rendimiento con RTX 4070', price: 2199.99, stock: 5, status: active, brand: 'HP', categories: ['Laptops', 'Electrónica'] },
];
