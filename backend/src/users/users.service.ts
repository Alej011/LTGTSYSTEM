import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  }

  async create(createUserDto: CreateUserDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: createUserDto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return user;
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true } });
  }

  update(id: string, data: { name?: string; role?: 'ADMIN' | 'SUPPORT' }) {
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true } });
  }
}
