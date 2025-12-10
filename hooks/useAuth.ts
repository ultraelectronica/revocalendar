'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient, DbProfile } from '@/lib/supabase';

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

  const supabase = createClient();

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

  // Initialize auth state with timeout and retry logic
  useEffect(() => {
    const SESSION_TIMEOUT = 8000; // 8 seconds timeout
    const MAX_RETRIES = 2;

    const initAuth = async (retryCount = 0): Promise<void> => {
      try {
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session loading timeout')), SESSION_TIMEOUT);
        });

        // Race between getting session and timeout
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise,
        ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

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
      } catch (error) {
        console.error(`[Auth] Error initializing auth (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
        
        // Retry if we haven't exhausted retries
        if (retryCount < MAX_RETRIES) {
          console.log('[Auth] Retrying session initialization...');
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return initAuth(retryCount + 1);
        }
        
        // After all retries, assume no session and stop loading
        console.warn('[Auth] Failed to get session after retries, assuming not authenticated');
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if profile exists, if not create it (for verified users or OAuth)
          const { data: existingProfile } = await fetchProfile(session.user.id);
          
          if (!existingProfile) {
            // User signed in without profile - create one
            // This handles both OTP verification and OAuth sign-in
            await createUserRecords(session.user, pendingSignupData.current.displayName);
            pendingSignupData.current = {};
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, createUserRecords]);

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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
    updateProfile,
  };
}

export { AuthContext };
export type { AuthContextType };
