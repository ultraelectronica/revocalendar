'use client';

import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient, createPasswordResetClient, DbProfile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signingOut: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null; needsVerification: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Store pending signup data for profile creation after verification
  const pendingSignupData = useRef<{ displayName?: string }>({});

  const isResetPasswordPage = typeof window !== 'undefined' && window.location.pathname === '/reset-password';
  const supabase = useMemo(() => {
    if (isResetPasswordPage) {
      // On reset-password page, avoid reading/writing auth sessions
      return createPasswordResetClient();
    }
    return createClient();
  }, [isResetPasswordPage]);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as DbProfile);
    }
    return { data, error };
  }, [supabase]);

  // Create profile and settings for a newly verified user or OAuth user
  const createUserRecords = useCallback(async (user: User, displayName?: string) => {
    // For OAuth users, get name from user metadata
    const oauthName = user.user_metadata?.full_name || user.user_metadata?.name;
    const oauthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const finalDisplayName = displayName || oauthName || user.email?.split('@')[0] || 'User';

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: finalDisplayName,
        avatar_url: oauthAvatar || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: 'dark',
        default_view: 'month',
        week_starts_on: 0,
        show_weekends: true,
        notification_enabled: true,
        notification_default_time: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (settingsError) {
      console.error('Error creating user settings:', settingsError);
    }

    // Fetch the created profile
    if (!profileError) {
      await fetchProfile(user.id);
    }
  }, [supabase, fetchProfile]);

  // Initialize auth state using onAuthStateChange with fallback for production
  useEffect(() => {
    if (isResetPasswordPage) {
      // Don't initialize auth state on reset-password page
      setLoading(false);
      return;
    }
    let isMounted = true;
    let hasInitialized = false;
    let eventFallbackTimeout: NodeJS.Timeout | null = null;
    let finalFallbackTimeout: NodeJS.Timeout | null = null;

    // Helper function to handle initial session setup
    const handleInitialSession = async (session: Session | null, source: string) => {
      if (hasInitialized || !isMounted) return; // Prevent double initialization
      
      // CRITICAL: Don't authenticate if we're on the reset-password page
      // Recovery sessions should not be treated as full authentication
      const isResetPasswordPage = typeof window !== 'undefined' && 
        window.location.pathname === '/reset-password';
      
      if (isResetPasswordPage && session?.user) {
        console.log(`[Auth] Recovery session detected on reset-password page - NOT initializing authentication`);
        hasInitialized = true;
        if (eventFallbackTimeout) clearTimeout(eventFallbackTimeout);
        if (finalFallbackTimeout) clearTimeout(finalFallbackTimeout);
        setLoading(false);
        // Don't set user or session - let the reset-password page handle it
        return;
      }
      
      hasInitialized = true;
      if (eventFallbackTimeout) clearTimeout(eventFallbackTimeout);
      if (finalFallbackTimeout) clearTimeout(finalFallbackTimeout);
      
      console.log(`[Auth] Initializing session from ${source}:`, session?.user?.email ?? 'no user');
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if profile exists
        const { data: existingProfile } = await fetchProfile(session.user.id);

        // If no profile and user is confirmed (OAuth or verified email), create profile
        if (!existingProfile && session.user.email_confirmed_at) {
          await createUserRecords(session.user);
        }
      }

      setLoading(false);
    };

    // Fallback: If no auth events fire within 1.5 seconds, try to get session directly
    // This handles cases where onAuthStateChange doesn't fire in production/edge environments
    eventFallbackTimeout = setTimeout(async () => {
      if (hasInitialized || !isMounted) return;
      
      console.log('[Auth] No auth events received, trying direct session check...');
      
      try {
        // Use getUser() as it's more reliable and validates the session
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted || hasInitialized) return;
        
        if (error) {
          const errorMessage = error.message?.toLowerCase() || '';
          console.log('[Auth] Direct session check error:', error.message);
          
          // Check if this is an invalid refresh token error
          const isInvalidSession = 
            errorMessage.includes('refresh token') ||
            errorMessage.includes('invalid') ||
            errorMessage.includes('expired') ||
            (errorMessage.includes('not found') && errorMessage.includes('token'));
          
          if (isInvalidSession) {
            console.warn('[Auth] Invalid/expired session detected, clearing...');
            // Sign out to clear the corrupted session cookies
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.warn('[Auth] Error during sign out cleanup:', signOutError);
            }
          } else if (error.message !== 'Auth session missing!') {
            console.error('[Auth] Unexpected auth error:', error);
          }
          
          await handleInitialSession(null, 'direct-check-no-session');
        } else if (user) {
          console.log('[Auth] Found user via direct check:', user.email);
          // Get the full session for the user
          const { data: { session } } = await supabase.auth.getSession();
          await handleInitialSession(session, 'direct-check');
        } else {
          await handleInitialSession(null, 'direct-check-no-user');
        }
      } catch (e) {
        // Supabase's auth internals sometimes abort requests when cleaning up locks.
        // Treat AbortError as a benign, expected case and don't log it as an error.
        if (e instanceof Error && e.name === 'AbortError') {
          console.warn('[Auth] Fallback session check was aborted (expected during cleanup).');
          if (!hasInitialized && isMounted) {
            await handleInitialSession(null, 'fallback-abort');
          }
          return;
        }

        console.error('[Auth] Error in fallback session check:', e);
        if (!hasInitialized && isMounted) {
          await handleInitialSession(null, 'fallback-error');
        }
      }
    }, 1500);

    // Final fallback: If still not initialized after 4 seconds, assume not authenticated
    finalFallbackTimeout = setTimeout(() => {
      if (!hasInitialized && isMounted) {
        console.warn('[Auth] Final fallback timeout: assuming not authenticated');
        setSession(null);
        setUser(null);
        setLoading(false);
        hasInitialized = true;
      }
    }, 4000);

    // Listen for auth changes - this will fire INITIAL_SESSION on mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[Auth] Auth state change:', event, session?.user?.email);

        // CRITICAL: Don't treat PASSWORD_RECOVERY as a login event
        // Recovery sessions should only allow password updates, not full authentication
        if (event === 'PASSWORD_RECOVERY') {
          console.log('[Auth] Password recovery session detected - NOT logging user in');
          // Don't set user or session - this is only for password reset
          // The reset-password page will handle the recovery session directly
          setLoading(false);
          return;
        }

        // Handle INITIAL_SESSION - this fires when the listener is first set up
        // Check if it's a recovery session by checking if we're on reset-password page
        if (event === 'INITIAL_SESSION') {
          // Check if this is a recovery session (user came from password reset link)
          // Recovery sessions typically have a specific type or we can check the URL
          const isRecoverySession = typeof window !== 'undefined' && 
            window.location.pathname === '/reset-password' &&
            session?.user;
          
          if (isRecoverySession) {
            console.log('[Auth] Initial session is a recovery session - NOT logging user in');
            // Don't authenticate - just allow the reset password page to handle it
            setLoading(false);
            return;
          }
          
          await handleInitialSession(session, 'INITIAL_SESSION');
          return;
        }

        // Handle SIGNED_IN - this may fire instead of/before INITIAL_SESSION after OAuth redirect
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a recovery session (shouldn't happen, but be safe)
          const isRecoverySession = typeof window !== 'undefined' && 
            window.location.pathname === '/reset-password';
          
          if (isRecoverySession) {
            console.log('[Auth] SIGNED_IN on reset-password page - treating as recovery, NOT logging in');
            setLoading(false);
            return;
          }
          
          // If we haven't initialized yet, treat this as our initial session
          if (!hasInitialized) {
            await handleInitialSession(session, 'SIGNED_IN');
            return;
          }
          
          // Otherwise, handle as normal sign in (profile creation if needed)
          setSession(session);
          setUser(session.user);
          
          const { data: existingProfile } = await fetchProfile(session.user.id);
          if (!existingProfile) {
            await createUserRecords(session.user, pendingSignupData.current.displayName);
            pendingSignupData.current = {};
          }
          return;
        }

        // Handle other auth events
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          // Ensure loading is false after sign out
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed successfully');
        }
      }
    );

    return () => {
      isMounted = false;
      if (eventFallbackTimeout) clearTimeout(eventFallbackTimeout);
      if (finalFallbackTimeout) clearTimeout(finalFallbackTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, createUserRecords, isResetPasswordPage]);

  // Sign up - sends OTP to email for verification (does NOT create profile yet)
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    // Store display name for later profile creation
    pendingSignupData.current = { displayName };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        // Don't set emailRedirectTo to get OTP instead of magic link
        emailRedirectTo: undefined,
      },
    });
    
    // Check if user needs email verification
    const needsVerification = !error && data.user && !data.user.confirmed_at;
    
    return { error, needsVerification: needsVerification ?? false };
  }, [supabase]);

  // Verify OTP code - creates profile after successful verification
  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    // If verification successful, create profile
    if (!error && data.user) {
      await createUserRecords(data.user, pendingSignupData.current.displayName);
      pendingSignupData.current = {};
    }

    return { error };
  }, [supabase, createUserRecords]);

  // Resend OTP code
  const resendOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, [supabase]);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    // Get the correct redirect URI based on environment
    const getRedirectUri = (): string => {
      // In browser, check if we're in local development
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        const hostname = window.location.hostname;
        
        // Check if we're in local development
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
        
        if (isLocalhost) {
          // In local development, use localhost
          return `${origin}/auth/callback`;
        }
        
        // In production (not localhost), prefer NEXT_PUBLIC_SITE_URL to ensure consistent redirects
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl) {
          const productionUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
          const cleanUrl = productionUrl.replace(/\/$/, '');
          console.log('[Auth] Production detected, using configured site URL:', cleanUrl);
          return `${cleanUrl}/auth/callback`;
        }
        
        // Fallback to current origin if no site URL configured
        console.log('[Auth] Production detected, using current origin:', origin);
        return `${origin}/auth/callback`;
      }
      
      // Server-side fallback - use production URL from env
      const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
      if (prodUrl) {
        const prodOrigin = prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`;
        return `${prodOrigin}/auth/callback`;
      }
      
      // Last resort fallback (shouldn't happen in production)
      return '/auth/callback';
    };

    const redirectTo = getRedirectUri();
    
    console.log('[Auth] Google OAuth redirect URI:', redirectTo);
    console.log('[Auth] Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');
    console.log('[Auth] Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('[Auth] Google OAuth error:', error);
    }
    
    return { error };
  }, [supabase]);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        setSigningOut(false);
        return { error: new Error(error.message) };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      pendingSignupData.current = {};

      // Clear any cached data from localStorage (optional - only if you want to clear local data on sign out)
      // Note: We're keeping localStorage data in case user wants to continue offline
      // If you want to clear it, uncomment the following:
      // try {
      //   localStorage.removeItem('calendar_events_v2');
      //   localStorage.removeItem('calendar_notes_v2');
      //   localStorage.removeItem('calendar_settings');
      // } catch (e) {
      //   console.warn('Could not clear localStorage:', e);
      // }

      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setSigningOut(false);
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      setSigningOut(false);
      return { error: err instanceof Error ? err : new Error('Failed to sign out') };
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    // Get the redirect URL - prefer environment variable, fallback to window location
    const getRedirectUrl = (): string => {
      if (typeof window === 'undefined') {
        // Server-side: use environment variable
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl) {
          const cleanUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
          return `${cleanUrl.replace(/\/$/, '')}/reset-password`;
        }
        return '/reset-password';
      }
      
      // Client-side: use current origin
      return `${window.location.origin}/reset-password`;
    };

    const redirectTo = getRedirectUrl();
    
    console.log('[Auth] Initiating password reset for:', email);
    console.log('[Auth] Redirect URL:', redirectTo);
    
    // Add timeout to prevent hanging (15 seconds - Supabase should respond much faster)
    const timeoutPromise = new Promise<{ error: AuthError }>((resolve) => {
      setTimeout(() => {
        console.warn('[Auth] Password reset request timed out after 15 seconds');
        resolve({
          error: {
            name: 'TimeoutError',
            message: 'Password reset request timed out. Please try again.',
          } as AuthError,
        });
      }, 15000); // 15 second timeout
    });

    try {
      const startTime = Date.now();
      
      // Race between the actual call and timeout
      const result = await Promise.race([
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        }).then(({ error }) => {
          const duration = Date.now() - startTime;
          console.log(`[Auth] Password reset request completed in ${duration}ms`, error ? `with error: ${error.message}` : 'successfully');
          return { error };
        }),
        timeoutPromise,
      ]);

      return result;
    } catch (err) {
      // Handle any unexpected errors
      console.error('[Auth] Password reset error:', err);
      return {
        error: {
          name: 'UnexpectedError',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
        } as AuthError,
      };
    }
  }, [supabase]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<Pick<DbProfile, 'display_name' | 'avatar_url'>>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  }, [supabase, user]);

  return {
    user,
    profile,
    session,
    loading,
    signingOut,
    isAuthenticated: !!user,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}

export { AuthContext };
export type { AuthContextType };
