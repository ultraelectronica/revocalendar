import { createServerClient } from '@/lib/supabase-server';
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
    // Use the new server client for proper cookie handling
    const supabase = await createServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log('[Auth Callback] Redirecting to:', `${baseUrl}${next}`);
      return NextResponse.redirect(`${baseUrl}${next}`);
    } else {
      console.error('[Auth Callback] Error exchanging code:', error);
    }
  }

  // Return to home page with error
  console.log('[Auth Callback] Redirecting to error page:', `${baseUrl}/?error=auth_callback_error`);
  return NextResponse.redirect(`${baseUrl}/?error=auth_callback_error`);
}

