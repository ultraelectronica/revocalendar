import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env vars are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env.'
    );
  }

  return { url, anonKey };
}

/**
 * Create a Supabase client for Server Components.
 * This client can read cookies but writing cookies may fail in some contexts.
 */
export async function createServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createSupabaseServerClient(url, anonKey, {
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
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Create a Supabase client for use in middleware.
 * This client can both read and write cookies via the request/response.
 */
export function createMiddlewareClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  
  // Create a response that can be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update request cookies for downstream use
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Clone the response with updated headers
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        // Set cookies on the response
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, response: () => response };
}

/**
 * Create a Supabase client for API routes (Route Handlers).
 * This is essentially the same as createServerClient but explicitly named.
 */
export async function createRouteHandlerClient() {
  return createServerClient();
}
