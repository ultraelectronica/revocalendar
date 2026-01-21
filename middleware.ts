import { createMiddlewareClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const isResetPasswordFlow =
    request.nextUrl.pathname === '/reset-password' || referer.includes('/reset-password');

  // Skip auth handling for reset-password flow to avoid recovery session
  if (isResetPasswordFlow) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      const errorMessage = error.message?.toLowerCase() || '';
      const isInvalidSession =
        errorMessage.includes('refresh token') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('not found');

      if (isInvalidSession) {
        console.warn('[Middleware] Invalid session detected, will be cleared on client');
      } else if (error.message !== 'Auth session missing!') {
        console.error('[Middleware] Auth error:', error.message);
      }
    }

    if (user) {
      console.log('[Middleware] User authenticated:', user.email);
    }
  } catch (e) {
    console.error('[Middleware] Unexpected error:', e);
  }

  return response();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|reset-password|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
