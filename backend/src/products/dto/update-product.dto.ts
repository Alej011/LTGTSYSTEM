import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ProductStatus } from "@prisma/client";

export class UpdateProductDto {
  @ApiProperty({ example: "Laptop HP Pavilion 15", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Laptop de alto rendimiento...", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "LP-HP-001", required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 1299.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ enum: ProductStatus, example: "active", required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ example: "clxxx123456789", required: false })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiProperty({
    example: ["clxxx123456789", "clxxx987654321"],
    description: "Array de IDs de categorías",
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];
}
