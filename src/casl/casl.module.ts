import { Module } from '@nestjs/common';
import { PoliciesGuard } from './policies.guard';

@Module({
  providers: [PoliciesGuard],
  exports: [PoliciesGuard],
})
export class CaslModule {}
