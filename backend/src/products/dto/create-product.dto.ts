import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ProductStatus } from "../../generated/prisma/enums";

export class CreateProductDto {
    @ApiProperty({ example: 'Laptop Dell XPS 13' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Laptop ultrabook con procesador Intel i7...', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'DELL-XPS13-001' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: 1299.99, minimum: 0 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @ApiProperty({ example: 25, minimum: 0 })
    @IsInt()
    @Min(0)
    stock: number;

    @ApiProperty({ enum: ProductStatus, example: 'active', required: false, default: 'active' })
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

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
    @ArrayMinSize(1)
    @ArrayUnique()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    categoryIds: string[];
}