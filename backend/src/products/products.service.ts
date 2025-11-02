import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryProductsDto } from "./dto/query-products.dto";
import {
  PaginatedProductsDto,
  PaginationMetadata,
} from "./dto/paginated-products.dto";
import { Prisma } from "@prisma/client";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene productos con paginación, filtros y búsqueda optimizada
   *
   * Los índices en Prisma optimizan estas queries:
   * - @@index([sku]) → Búsqueda rápida por SKU
   * - @@index([brandId]) → Filtro rápido por marca
   * - @@index([status]) → Filtro rápido por estado
   * - @@index([name]) → Búsqueda rápida por nombre
   */
  async findAll(query: QueryProductsDto): Promise<PaginatedProductsDto> {
    const {
      search,
      category,
      status,
      brandId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    // Construir filtros WHERE (aprovecha índices)
    const where: Prisma.ProductWhereInput = {
      AND: [
        // Búsqueda por nombre, SKU o marca (usa índices de name y sku)
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                {
                  brand: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {},

        // Filtro por estado (usa índice de status)
        status ? { status } : {},

        // Filtro por marca (usa índice de brandId)
        brandId ? { brandId } : {},

        // Filtro por categoría (relación many-to-many)
        category
          ? {
              categories: {
                some: {
                  category: {
                    name: { equals: category, mode: "insensitive" },
                  },
                },
              },
            }
          : {},
      ],
    };

    // Configurar ordenamiento
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar queries en paralelo para optimizar
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMetadata = {
      page,
      limit,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };

    // Transformar datos de Prisma a DTO
    const transformedProducts = products.map((product) => ({
      ...product,
      description: product.description || '', // null → string vacío
      price: product.price.toNumber(), // Decimal → number
      categories: product.categories.map((pc) => pc.category), // Aplanar relación many-to-many
    }));

    return {
      data: transformedProducts,
      meta,
    };
  }

  async create(
    createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    const { categoryIds, ...productData } = createProductDto;

    // Preparar datos para crear
    const createData: any = {
      name: productData.name,
      sku: productData.sku,
      price: productData.price,
      stock: productData.stock,
      brandId: productData.brandId,
      categories: {
        create: categoryIds.map((categoryId) => ({
          category: {
            connect: { id: categoryId },
          },
        })),
      },
    };

    // Agregar campos opcionales solo si existen
    if (productData.description) {
      createData.description = productData.description;
    }
    if (productData.status) {
      createData.status = productData.status;
    }

    // Crear producto con relaciones incluidas
    const product = await this.prisma.product.create({
      data: createData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transformar respuesta a DTO
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price.toNumber(),
      stock: product.stock,
      status: product.status,
      brand: (product as any).brand,
      categories: (product as any).categories.map((pc: any) => pc.category),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
