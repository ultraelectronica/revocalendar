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
      // Handle specific auth errors that indicate a corrupted session
      const errorMessage = error.message?.toLowerCase() || '';
      const isInvalidSession = 
        errorMessage.includes('refresh token') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('not found');
      
      if (isInvalidSession) {
        console.warn('[Middleware] Invalid session detected, will be cleared on client');
        // The client-side will handle session cleanup
        // We just let the request through without blocking
      } else if (error.message !== 'Auth session missing!') {
        console.error('[Middleware] Auth error:', error.message);
      }
    }
    
    // The getUser() call will automatically refresh the session if needed
    // and the refreshed tokens will be set in cookies by the supabase client
    if (user) {
      console.log('[Middleware] User authenticated:', user.email);
    }
  } catch (e) {
    // Catch any unexpected errors to prevent middleware from crashing
    console.error('[Middleware] Unexpected error:', e);
    // Continue anyway - don't block the request
  }

  return response();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
