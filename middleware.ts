import { createMiddlewareClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for middleware
  const { supabase, response } = createMiddlewareClient(request);

  // IMPORTANT: Use getUser() instead of getSession() for proper token refresh
  // getSession() is deprecated and doesn't validate the JWT on the server
  // getUser() makes a request to Supabase Auth server to validate and refresh the session
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Log but don't block - user might just not be logged in
      if (error.message !== 'Auth session missing!') {
        console.error('[Middleware] Auth error:', error.message);
      }
    }
    
    // The getUser() call will automatically refresh the session if needed
    // and the refreshed tokens will be set in cookies by the supabase client
    if (user) {
      console.log('[Middleware] User authenticated:', user.email);
    }
  } catch (e) {
    console.error('[Middleware] Unexpected error:', e);
  }

  return response();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
