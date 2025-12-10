import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Get the correct base URL for redirects
  // Use NEXT_PUBLIC_SITE_URL in production to ensure consistent redirects
  const getBaseUrl = (): string => {
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    // If we're on localhost, use it for development
    if (isLocalhost) {
      console.log('[Auth Callback] Using localhost origin:', origin);
      return origin;
    }
    
    // In production, prefer the configured site URL to avoid localhost redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (siteUrl) {
      const productionUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
      // Remove trailing slash if present
      const cleanUrl = productionUrl.replace(/\/$/, '');
      console.log('[Auth Callback] Using production site URL:', cleanUrl);
      return cleanUrl;
    }
    
    // Fallback to request origin if no site URL configured
    console.log('[Auth Callback] Using production origin:', origin);
    return origin;
  };

  const baseUrl = getBaseUrl();

  if (code) {
    const cookieStore = await cookies();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Auth Callback] Missing Supabase environment variables');
      return NextResponse.redirect(`${baseUrl}/?error=config_error`);
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Log but don't throw - cookies might be set in middleware
            console.warn('[Auth Callback] Could not set cookie:', error);
          }
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      console.log('[Auth Callback] Session created for:', data.session.user.email);
      console.log('[Auth Callback] Redirecting to:', `${baseUrl}${next}`);
      
      // Create redirect response
      const redirectResponse = NextResponse.redirect(`${baseUrl}${next}`);
      
      return redirectResponse;
    } else {
      console.error('[Auth Callback] Error exchanging code:', error?.message);
    }
  }

  // Return to home page with error
  console.log('[Auth Callback] Redirecting to error page:', `${baseUrl}/?error=auth_callback_error`);
  return NextResponse.redirect(`${baseUrl}/?error=auth_callback_error`);
}
