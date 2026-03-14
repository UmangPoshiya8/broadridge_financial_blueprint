import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Signup | InvestorConnect Pro' };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-slate-600">Already registered? <Link href="/auth/login" className="text-primary">Login</Link></p>
      </div>
    </main>
  );
}

