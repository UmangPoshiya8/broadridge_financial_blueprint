import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const variantClass = {
    default: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-accent text-white hover:opacity-90',
    outline: 'border border-border bg-white text-foreground hover:bg-muted',
    destructive: 'bg-red-600 text-white hover:bg-red-500'
  }[variant];

  return <button className={cn('inline-flex items-center rounded-md px-4 py-2 text-sm font-medium', variantClass, className)} {...props} />;
}

