import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las marcas ordenadas alfabéticamente
   */
  async findAll() {
    return this.prisma.brand.findMany({
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
   * Obtiene una marca por ID
   */
  async findOne(id: string) {
    const item = await this.prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!item) throw new NotFoundException('Marca no encontrada');
    return item;
  }
}
