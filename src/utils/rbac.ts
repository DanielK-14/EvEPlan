import type { User } from 'firebase/auth';
import type { SharingRules } from '../types';

export type Role = 'admin' | 'read-only' | 'no-access';

export function resolveRole(user: User | null, sharingRules?: SharingRules, createdByUid?: string): Role {
  if (!user) return 'no-access';
  const email = user.email ?? '';
  if (user.uid === createdByUid) return 'admin';
  if (sharingRules?.admins.includes(email)) return 'admin';
  if (sharingRules?.viewers.includes(email)) return 'read-only';
  if (sharingRules?.publicCanView) return 'read-only';
  return 'no-access';
}

export function canEdit(role: Role): boolean {
  return role === 'admin';
}

export function isAdmin(role: Role): boolean {
  return role === 'admin';
}
