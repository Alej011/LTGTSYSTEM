export interface Brand {
  id: string
  name: string
  description?: string
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  brandId: string
  brand?: Brand
  sku: string
  stock: number
  price: number
  category: string
  status: "active" | "inactive" | "discontinued"
  createdAt: Date
  updatedAt: Date
}

// Mock data - In production, this would be a real database
export const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Dell",
    description: "Tecnología y computadoras",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "HP",
    description: "Hardware y software empresarial",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Lenovo",
    description: "Dispositivos y soluciones tecnológicas",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Canon",
    description: "Impresoras y equipos de oficina",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Microsoft",
    description: "Software y servicios en la nube",
    createdAt: new Date("2024-01-01"),
  },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Dell XPS 13",
    description: "Laptop ultrabook con procesador Intel i7, 16GB RAM, 512GB SSD",
    brandId: "1",
    sku: "DELL-XPS13-001",
    stock: 25,
    price: 1299.99,
    category: "Laptops",
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Monitor HP 27 4K",
    description: "Monitor 4K de 27 pulgadas con tecnología IPS",
    brandId: "2",
    sku: "HP-MON27-4K",
    stock: 15,
    price: 399.99,
    category: "Monitores",
    status: "active",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "ThinkPad Lenovo T14",
    description: "Laptop empresarial con procesador AMD Ryzen 7, 32GB RAM",
    brandId: "3",
    sku: "LEN-T14-AMD",
    stock: 8,
    price: 1599.99,
    category: "Laptops",
    status: "active",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    name: "Impresora Canon PIXMA",
    description: "Impresora multifuncional a color con WiFi",
    brandId: "4",
    sku: "CAN-PIXMA-001",
    stock: 0,
    price: 199.99,
    category: "Impresoras",
    status: "active",
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    id: "5",
    name: "Office 365 Business",
    description: "Licencia anual de Microsoft Office 365 para empresas",
    brandId: "5",
    sku: "MS-O365-BIZ",
    stock: 100,
    price: 149.99,
    category: "Software",
    status: "active",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
]

// Add brand information to products
export const getProductsWithBrands = (): Product[] => {
  return mockProducts.map((product) => ({
    ...product,
    brand: mockBrands.find((brand) => brand.id === product.brandId),
  }))
}

export const getProductById = (id: string): Product | undefined => {
  const product = mockProducts.find((p) => p.id === id)
  if (product) {
    return {
      ...product,
      brand: mockBrands.find((brand) => brand.id === product.brandId),
    }
  }
  return undefined
}

export const getBrands = (): Brand[] => {
  return mockBrands
}

export const createProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newProduct: Product = {
    ...productData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockProducts.push(newProduct)
  return newProduct
}

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockProducts.findIndex((p) => p.id === id)
  if (index === -1) return null

  mockProducts[index] = {
    ...mockProducts[index],
    ...productData,
    updatedAt: new Date(),
  }

  return mockProducts[index]
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockProducts.findIndex((p) => p.id === id)
  if (index === -1) return false

  mockProducts.splice(index, 1)
  return true
}
