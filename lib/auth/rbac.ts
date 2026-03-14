import type { UserRole } from '@/types/domain';

export function canAccessCrossInstitution(role: UserRole): boolean {
  return role === 'platform_admin';
}

export function canManageInstitution(role: UserRole): boolean {
  return role === 'platform_admin' || role === 'institution_admin';
}

export function canVote(role: UserRole): boolean {
  return role === 'investor';
}

