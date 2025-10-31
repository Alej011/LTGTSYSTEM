import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll() { return this.users.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; role?: 'ADMIN' | 'SUPPORT' }) {
    return this.users.update(id, body);
  }
}
