import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BrandsService } from './brands.service';
import { BrandDto } from './dto/brand.dto';

@ApiTags('brands')
@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Listar todas las marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas ordenadas alfabéticamente', type: [BrandDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findAll(): Promise<BrandDto[]> {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @ApiResponse({ status: 200, description: 'Marca encontrada', type: BrandDto })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  async findOne(@Param('id') id: string): Promise<BrandDto> {
    return this.brandsService.findOne(id);
  }
}
