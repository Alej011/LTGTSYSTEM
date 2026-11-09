import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerOptions } from '@nestjs/throttler';

type LoginRequest = { ip?: string; body?: { email?: unknown } };

function accountKey(req: LoginRequest): string {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  return email || `ip:${req.ip ?? 'unknown'}`;
}

// login-account frena la fuerza bruta sobre una cuenta aunque cambie la IP.
// login-ip frena probar muchas cuentas desde la misma IP; depende de que la IP reenviada sea fiable.
export const LOGIN_THROTTLERS: ThrottlerOptions[] = [
  { name: 'login-account', ttl: 60_000, limit: 5, getTracker: (req) => accountKey(req as LoginRequest) },
  { name: 'login-ip', ttl: 60_000, limit: 20, getTracker: (req) => (req as LoginRequest).ip ?? 'unknown' },
];

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {}
