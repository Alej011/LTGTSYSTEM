import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ProductStatus } from "@prisma/client";

export class CreateProductDto {
    @ApiProperty({ example: 'Laptop Dell XPS 13' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Laptop ultrabook con procesador Intel i7...' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'DELL-XPS13-001' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 1299.99 })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: 25 })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ enum: ProductStatus, example: 'active' })
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus = 'active';

    @ApiProperty({ example: 'clxyz123' })
    @IsString()
    @IsNotEmpty()
    brandId: string;

    @ApiProperty({
        example: ['clcat123', 'clcat456'],
        description: 'IDs de categorías (al menos una requerida)',
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    categoryIds: string[];
}