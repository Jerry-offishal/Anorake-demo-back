import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from 'src/schemas/organization.schema';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret-key'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { id: string; email: string; passwordHash: string },
  ) {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    let roles: string[] = [];

    if (tenantId) {
      const org = await this.organizationModel
        .findOne({ userId: payload.id, tenantId })
        .lean()
        .exec();
      roles = org?.role ?? [];
    }

    return {
      id: payload.id,
      email: payload.email,
      roles,
    };
  }
}
