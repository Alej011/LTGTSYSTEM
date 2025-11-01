import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para query parameters al listar productos
 * Soporta búsqueda, filtros y paginación
 */
export class QueryProductsDto {
  // Búsqueda
  @ApiPropertyOptional({
    description: 'Buscar por nombre, SKU o marca',
    example: 'Dell',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Filtros
  @ApiPropertyOptional({
    description: 'Filtrar por categoría (nombre)',
    example: 'Laptops',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ['active', 'inactive', 'discontinued'],
    example: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'discontinued'])
  status?: 'active' | 'inactive' | 'discontinued';

  @ApiPropertyOptional({
    description: 'Filtrar por ID de marca',
    example: 'clxyz123',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  // Paginación
  @ApiPropertyOptional({
    description: 'Número de página (empieza en 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de items por página',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  // Ordenamiento
  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['name', 'price', 'stock', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'price', 'stock', 'createdAt'])
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
