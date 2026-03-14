'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/shareholders', label: 'Shareholders' },
  { href: '/securities', label: 'Securities' },
  { href: '/trades', label: 'Trades' },
  { href: '/settlements', label: 'Settlements' },
  { href: '/voting', label: 'Voting' },
  { href: '/documents', label: 'Documents' },
  { href: '/communications', label: 'Communications' },
  { href: '/admin', label: 'Admin' }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-4 py-5 text-lg font-semibold text-primary">InvestorConnect Pro</div>
      <nav className="grid grid-cols-3 gap-2 p-3 md:grid-cols-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm',
              pathname === link.href ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

