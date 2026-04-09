import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY, PolicyRule } from './policies.decorator';
import { createAbilityForUser, UserContext } from './casl-ability.factory';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const rules = this.reflector.getAllAndOverride<PolicyRule[]>(
      CHECK_POLICIES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // No policy defined → allow (endpoint not restricted by CASL)
    if (!rules || rules.length === 0) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest<{ user?: UserContext }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const ability = createAbilityForUser(user);

    const allowed = rules.every((rule) =>
      ability.can(rule.action, rule.subject),
    );

    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
