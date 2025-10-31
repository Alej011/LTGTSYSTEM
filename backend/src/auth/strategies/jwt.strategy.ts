import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }
  async validate(payload: any) {
    // payload: { sub: user.id, role: 'ADMIN'|'SUPPORT', email }
    return { id: payload.sub, role: payload.role, email: payload.email, name: payload.name };
  }
}
