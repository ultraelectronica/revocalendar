import { createMiddlewareClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for middleware
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh session if expired - required for Server Components
  // This will automatically refresh the session cookie if needed
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Middleware] Session error:', error.message);
    }
    
    // If we have a session, ensure it's refreshed
    if (session) {
      // getSession already handles refresh internally
      // The refreshed tokens are set in cookies by the supabase client
    }
  } catch (e) {
    console.error('[Middleware] Unexpected error:', e);
  }

  return response();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
