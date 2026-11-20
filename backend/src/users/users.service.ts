import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = { id: true, email: true, name: true, role: true } as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: USER_SELECT });
  }

  // Único camino de alta de usuarios: el email repetido responde 409
  async create({ password, ...data }: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    return this.prisma.user.create({
      data: { ...data, password: await bcrypt.hash(password, 10) },
      select: USER_SELECT,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }
}
