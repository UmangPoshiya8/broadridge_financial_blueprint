import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Login | InvestorConnect Pro' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-slate-600">No account? <Link href="/auth/signup" className="text-primary">Sign up as investor</Link></p>
      </div>
    </main>
  );
}

