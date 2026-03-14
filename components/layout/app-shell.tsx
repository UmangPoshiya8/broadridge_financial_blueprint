'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';

export function AppShell({ children, userName }: { children: ReactNode; userName: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <p className="text-sm text-slate-600">Signed in as {userName}</p>
          <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
        </header>
        <main className="space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}

