import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

/**
 * Metadata de paginación
 */
export class PaginationMetadata {
  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items por página', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total de items', example: 150 })
  total: number;

  @ApiProperty({ description: 'Total de páginas', example: 8 })
  totalPages: number;

  @ApiProperty({ description: 'Hay página anterior', example: false })
  hasPrevPage: boolean;

  @ApiProperty({ description: 'Hay página siguiente', example: true })
  hasNextPage: boolean;
}

/**
 * Respuesta paginada de productos
 */
export class PaginatedProductsDto {
  @ApiProperty({
    description: 'Lista de productos',
    type: [ProductResponseDto],
  })
  data: ProductResponseDto[];

  @ApiProperty({
    description: 'Metadata de paginación',
    type: PaginationMetadata,
  })
  meta: PaginationMetadata;
}
