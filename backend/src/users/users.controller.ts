import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  findAll() { return this.users.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'clxyz123abc' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'clxyz123abc' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Juan Pérez' },
        role: { type: 'string', enum: ['ADMIN', 'SUPPORT'], example: 'SUPPORT' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  update(@Param('id') id: string, @Body() body: { name?: string; role?: 'ADMIN' | 'SUPPORT' }) {
    return this.users.update(id, body);
  }
}
