import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthUser } from '../../auth/strategies/jwt.strategy';

export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
  return ctx.switchToHttp().getRequest<{ user?: AuthUser }>().user;
});
