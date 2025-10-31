import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true } });
  }

  update(id: string, data: { name?: string; role?: 'ADMIN' | 'SUPPORT' }) {
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true } });
  }
}
