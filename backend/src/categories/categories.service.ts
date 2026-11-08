import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las categorías ordenadas alfabéticamente
   */
  async findAll() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Obtiene una categoría por ID
   */
  async findOne(id: string) {
    const item = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }
}
