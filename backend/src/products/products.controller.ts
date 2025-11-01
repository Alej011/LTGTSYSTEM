import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { PaginatedProductsDto } from "./dto/paginated-products.dto";
import { QueryProductsDto } from "./dto/query-products.dto";
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
  @ApiOperation({
    summary: 'Listar productos con paginación y filtros',
    description: `
      Obtiene productos con soporte para:
      - Búsqueda por nombre, SKU o marca
      - Filtros por categoría, estado o marca
      - Paginación con metadata
      - Ordenamiento customizable

      **Optimizado con índices de PostgreSQL para 2000+ productos**
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Productos paginados con metadata',
    type: PaginatedProductsDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findAll(@Query() query: QueryProductsDto): Promise<PaginatedProductsDto> {
    return this.productsService.findAll(query);
  }
}