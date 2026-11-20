import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías ordenadas alfabéticamente', type: [CategoryDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada', type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(id);
  }
}
