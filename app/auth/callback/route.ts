import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Get the correct base URL for redirects
  // Prefer production URL from env vars, fallback to request origin
  const getBaseUrl = (): string => {
    const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    if (prodUrl) {
      // If we have a production URL configured, use it
      const baseUrl = prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`;
      
      // In production (non-localhost), always use the production URL from env
      // This ensures we redirect to the correct domain even if Supabase redirects to localhost
      if (!isLocalhost) {
        console.log('[Auth Callback] Using production URL from env:', baseUrl);
        return baseUrl;
      }
      
      // In localhost, check if we should still use prod URL (for testing)
      // But typically in localhost, we want to use localhost
      // Only use prod URL if explicitly configured and we're not in local dev
      const isLocalDev = process.env.NODE_ENV === 'development';
      if (!isLocalDev) {
        console.log('[Auth Callback] Not in local dev, using production URL:', baseUrl);
        return baseUrl;
      }
    }
    
    // Fallback to request origin (works for both local and production)
    console.log('[Auth Callback] Using request origin:', origin);
    return origin;
  };

  const baseUrl = getBaseUrl();

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

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

