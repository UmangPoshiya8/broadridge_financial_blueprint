import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
