import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { QueryProductsDto } from './dto/query-products.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

const productInclude = {
  brand: { select: { id: true, name: true } },
  categories: { include: { category: { select: { id: true, name: true } } } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toCategoryLinks(categoryIds: string[]) {
  return categoryIds.map((id) => ({ category: { connect: { id } } }));
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto): Promise<PaginatedProductsDto> {
    const { search, category, status, brandId, maxStock, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      ...(brandId && { brandId }),
      ...(maxStock !== undefined && { stock: { lte: maxStock } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(category && {
        categories: { some: { category: { name: { equals: category, mode: 'insensitive' } } } },
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: products.map(toResponse),
      meta: { page, limit, total, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return toResponse(product);
  }

  async create({ categoryIds, ...data }: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: { ...data, categories: { create: toCategoryLinks(categoryIds) } },
      include: productInclude,
    });
    return toResponse(product);
  }

  // La escritura anidada se ejecuta en una transacción: si falla, las categorías no se pierden.
  async update(id: string, { categoryIds, ...data }: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(categoryIds && { categories: { deleteMany: {}, create: toCategoryLinks(categoryIds) } }),
      },
      include: productInclude,
    });
    return toResponse(product);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}

function toResponse(product: ProductWithRelations): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    sku: product.sku,
    price: product.price.toNumber(),
    stock: product.stock,
    status: product.status,
    brand: product.brand,
    categories: product.categories.map(({ category }) => category),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
