import { ApiProperty } from '@nestjs/swagger';

import { ProductStatus } from '../../generated/prisma/enums';

export class BrandSummaryDto {
  @ApiProperty({ example: 'clxyz123' })
  id: string;

  @ApiProperty({ example: 'Dell' })
  name: string;
}

export class CategorySummaryDto {
  @ApiProperty({ example: 'clxyz456' })
  id: string;

  @ApiProperty({ example: 'Laptops' })
  name: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'clxyz789' })
  id: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  name: string;

  @ApiProperty({ example: 'Laptop ultrabook con procesador Intel i7...' })
  description: string;

  @ApiProperty({ example: 'DELL-XPS13-001' })
  sku: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiProperty({ example: 25 })
  stock: number;

  @ApiProperty({ enum: ProductStatus, enumName: 'ProductStatus', example: 'active' })
  status: ProductStatus;

  @ApiProperty({ example: 'clx1brand000001' })
  brandId: string;

  @ApiProperty({ type: BrandSummaryDto })
  brand: BrandSummaryDto;

  @ApiProperty({ type: [CategorySummaryDto] })
  categories: CategorySummaryDto[];

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  updatedAt: Date;
}
