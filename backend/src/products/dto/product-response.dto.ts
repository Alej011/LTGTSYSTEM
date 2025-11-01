import { ApiProperty } from '@nestjs/swagger';

  export class BrandResponseDto {
    @ApiProperty({ example: 'clxyz123' })
    id: string;

    @ApiProperty({ example: 'Dell' })
    name: string;
  }

  export class CategoryResponseDto {
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

    @ApiProperty({ enum: ['active', 'inactive', 'discontinued'], example: 'active' })
    status: string;

    @ApiProperty({ type: BrandResponseDto })
    brand: BrandResponseDto;

    @ApiProperty({ type: [CategoryResponseDto] })
    categories: CategoryResponseDto[];

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    updatedAt: Date;
  }