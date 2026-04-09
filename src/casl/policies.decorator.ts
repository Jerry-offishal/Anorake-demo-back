import { SetMetadata } from '@nestjs/common';
import { Action, Subject } from './casl-ability.factory';

export const CHECK_POLICIES_KEY = 'check_policies';

export interface PolicyRule {
  action: Action;
  subject: Subject;
}

export const CheckPolicies = (...rules: PolicyRule[]) =>
  SetMetadata(CHECK_POLICIES_KEY, rules);
