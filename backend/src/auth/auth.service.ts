import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../generated/prisma/enums';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_REUSE_GRACE_MS, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants';

export type AccessTokenPayload = { sub: string; role: Role; email: string; name: string };

type SessionUser = { id: string; email: string; name: string; role: Role };

type SessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  user: SessionUser;
};

const USER_SELECT = { id: true, email: true, name: true, role: true } as const;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already in use');
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, password, name: dto.name, role: dto.role },
      select: { ...USER_SELECT, createdAt: true },
    });
  }

  async login(dto: LoginDto): Promise<SessionTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });

    const session: SessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const refresh = await this.createRefreshToken(user.id);
    return { ...(await this.createAccessToken(session)), ...refresh.response, user: session };
  }

  // Rota el refresh token: el presentado queda revocado y se emite uno nuevo.
  async refresh(token: string): Promise<SessionTokens> {
    const now = new Date();
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: USER_SELECT } },
    });

    if (!stored || stored.expiresAt <= now) throw new UnauthorizedException('Invalid refresh token');

    if (stored.revokedAt) {
      const withinGrace = now.getTime() - stored.revokedAt.getTime() < REFRESH_REUSE_GRACE_MS;
      if (stored.replacedById && withinGrace) {
        if (await this.isActive(stored.replacedById, now)) {
          return { ...(await this.createAccessToken(stored.user)), user: stored.user };
        }
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (stored.replacedById) {
        // Reutilización fuera de la ventana: posible robo, se cierran todas las sesiones del usuario.
        await this.revokeAll(stored.userId, now);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const next = await this.createRefreshToken(stored.userId);
    const revoked = await this.prisma.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: now, replacedById: next.id },
    });
    if (revoked.count === 0) {
      // Otra petición rotó este token en paralelo; se descarta el nuevo y se usa la ventana de gracia.
      await this.prisma.refreshToken.delete({ where: { id: next.id } });
      return this.refresh(token);
    }

    return { ...(await this.createAccessToken(stored.user)), ...next.response, user: stored.user };
  }

  async logout(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  me(user: { id: string }) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: { ...USER_SELECT, createdAt: true },
    });
  }

  private async createAccessToken(user: SessionUser) {
    const payload: AccessTokenPayload = { sub: user.id, role: user.role, email: user.email, name: user.name };
    return {
      accessToken: await this.jwt.signAsync(payload),
      accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000).toISOString(),
    };
  }

  private async createRefreshToken(userId: string) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const { id } = await this.prisma.refreshToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
      select: { id: true },
    });
    return { id, response: { refreshToken: token, refreshTokenExpiresAt: expiresAt.toISOString() } };
  }

  private async isActive(id: string, now: Date) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id }, select: { revokedAt: true, expiresAt: true } });
    return !!token && !token.revokedAt && token.expiresAt > now;
  }

  private revokeAll(userId: string, now: Date) {
    return this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
  }
}
