import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [UserDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  findAll(): Promise<UserDto[]> {
    return this.users.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.users.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'clxyz123abc' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.users.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'clxyz123abc' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o campos no permitidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de ADMIN' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.users.update(id, updateUserDto);
  }
}
