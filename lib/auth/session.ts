import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AppUser, UserRole } from '@/types/domain';

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase.from('users').select('id,email,name,role,institution_id').eq('id', auth.user.id).single();
  if (!data) return null;

  return data as AppUser;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AppUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/dashboard');
  return user;
}

