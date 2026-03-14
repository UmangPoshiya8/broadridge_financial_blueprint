import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="max-w-3xl text-5xl font-bold text-slate-900">InvestorConnect Pro</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Unified shareholder registry, proxy voting, investor communications, and settlement intelligence for modern institutions.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/auth/login"><Button>Login</Button></Link>
          <Link href="/auth/signup"><Button variant="outline">Investor Signup</Button></Link>
        </div>
      </section>
    </main>
  );
}

