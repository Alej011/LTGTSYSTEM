import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { ProductResponseDto } from "./dto/product-response.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("products")
@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "List of products", type: [ProductResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(){
    return this.productsService.findAll();
  }
}