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
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null; needsVerification: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
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

  // Create profile and settings for a newly verified user
  const createUserRecords = useCallback(async (user: User, displayName?: string) => {
    const finalDisplayName = displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: finalDisplayName,
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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
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
          // Check if profile exists, if not create it (for verified users)
          const { data: existingProfile } = await fetchProfile(session.user.id);
          
          if (!existingProfile && session.user.email_confirmed_at) {
            // User just verified their email - create profile now
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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
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
    isAuthenticated: !!user,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
}

export { AuthContext };
export type { AuthContextType };
