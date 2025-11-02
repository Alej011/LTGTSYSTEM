import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías ordenadas alfabéticamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
