import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // example: header x-tenant-id or subdomain parsing
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return res.status(400).json({ messega: 'Tenant not provided' });
    }
    (req as Request & { tenantId: string }).tenantId = tenantId;
    next();
  }
}
