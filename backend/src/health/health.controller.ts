import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';
import { HealthDto } from './dto/health.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Estado de la API y de la conexión a la base de datos' })
  @ApiResponse({ status: 200, description: 'API y base de datos disponibles', type: HealthDto })
  @ApiResponse({ status: 503, description: 'Base de datos no disponible' })
  async check(): Promise<HealthDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return { status: 'ok', database: 'up' };
  }
}
