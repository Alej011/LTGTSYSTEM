import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

type LoginRequest = { ip?: string; body?: { email?: unknown } };

// Las peticiones llegan desde el BFF con una sola IP, así que el límite se aplica por cuenta.
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: LoginRequest): Promise<string> {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return email ? `login:${email}` : `login-ip:${req.ip ?? 'unknown'}`;
  }
}
