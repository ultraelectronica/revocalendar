'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

// Password requirements (same as AuthModal)
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

// Password requirement indicator
function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
      met ? 'text-emerald-400' : 'text-white/30'
    }`}>
      <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
        met ? 'bg-emerald-400 scale-125' : 'bg-white/30'
      }`} />
      {label}
    </div>
  );
}

// Portal Reveal Toggle for password visibility
function PortalRevealToggle({ 
  revealed, 
  onToggle,
  scanning 
}: { 
  revealed: boolean; 
  onToggle: () => void;
  scanning: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center group"
      aria-label={revealed ? 'Hide password' : 'Reveal password'}
    >
      {/* Outer ring - portal frame */}
      <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
        revealed 
          ? 'border-orange-500/80 shadow-[0_0_12px_rgba(249,115,22,0.5)]' 
          : 'border-white/20 group-hover:border-white/40'
      }`} />
      
      {/* Inner portal effect */}
      <div className={`absolute inset-1 rounded-full transition-all duration-500 overflow-hidden ${
        revealed ? 'bg-gradient-to-br from-orange-600/40 to-yellow-500/40' : 'bg-white/5'
      }`}>
        {/* Swirling animation when revealed */}
        {revealed && (
          <>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-orange-400/60 origin-bottom" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-yellow-400/60 origin-bottom rotate-90" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-orange-400/40 origin-bottom rotate-180" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-yellow-400/40 origin-bottom -rotate-90" />
            </div>
            {/* Core glow */}
            <div className="absolute inset-2 rounded-full bg-white/20 animate-pulse" />
          </>
        )}
      </div>
      
      {/* Icon */}
      <svg 
        className={`relative w-4 h-4 transition-all duration-300 ${
          revealed ? 'text-white scale-90' : 'text-white/50 group-hover:text-white/70'
        }`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {revealed ? (
          // Open eye
          <>
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              className="animate-pulse"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
            />
          </>
        ) : (
          // Closed eye
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
          />
        )}
      </svg>

      {/* Scan line effect */}
      {scanning && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div 
            className="absolute h-full w-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent"
            style={{
              animation: 'scan 0.6s ease-out forwards',
            }}
          />
        </div>
      )}
    </button>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [scanningPassword, setScanningPassword] = useState(false);
  const [scanningConfirm, setScanningConfirm] = useState(false);
  
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient>(createClient());
  const supabase = supabaseRef.current;

  // Password validation
  const passwordValidation = useMemo(() => ({
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
    hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
    hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
    hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(password),
  }), [password]);

  const isPasswordValid = useMemo(() => 
    Object.values(passwordValidation).every(Boolean),
    [passwordValidation]
  );

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Toggle password visibility with scan effect
  const togglePasswordVisibility = () => {
    setScanningPassword(true);
    setTimeout(() => {
      setShowPassword(!showPassword);
      setScanningPassword(false);
    }, 300);
  };

  const toggleConfirmPasswordVisibility = () => {
    setScanningConfirm(true);
    setTimeout(() => {
      setShowConfirmPassword(!showConfirmPassword);
      setScanningConfirm(false);
    }, 300);
  };

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[ResetPassword] Error checking session:', error);
        setIsValidSession(false);
        return;
      }

      // Check if this is a recovery session (user clicked reset password link)
      if (session?.user) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();

    // Listen for auth state changes (recovery link will trigger this)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[ResetPassword] Auth event:', event);
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setIsValidSession(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('[ResetPassword] Starting password update...');

    try {
      // Directly call updateUser - the session is already validated at mount
      console.log('[ResetPassword] Calling updateUser...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });
      
      console.log('[ResetPassword] updateUser completed:', { hasData: !!data, hasError: !!error });
      
      console.log('[ResetPassword] updateUser response:', { data, error });

      if (error) {
        console.error('[ResetPassword] Update error:', error);
        // Check if the error indicates same password (Supabase may return this)
        if (error.message.toLowerCase().includes('same') || 
            error.message.toLowerCase().includes('different')) {
          setError('Cannot use your previous password. Please choose a different one.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('[ResetPassword] Password updated successfully');
        // Password updated successfully - sign out all sessions to clear any interfering sessions
        // This ensures the user starts fresh with their new password
        await supabase.auth.signOut({ scope: 'global' });
        console.log('[ResetPassword] All sessions signed out');
        setSuccess(true);
      }
    } catch (err) {
      console.error('[ResetPassword] Exception:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      console.log('[ResetPassword] Finished, setting loading to false');
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-orange-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-white/60">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Link Expired or Invalid</h1>
            <p className="text-sm text-white/50 mt-2">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
          </div>

          {/* Back to home button */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative glass-card p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-t-2xl" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Password Updated!</h1>
            <p className="text-sm text-white/50 mt-2">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
          </div>

          {/* Go back to login button */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
          >
            Go Back to Login
          </button>

          {/* Security notice */}
          <div className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p className="text-xs text-white/40 leading-relaxed">
                All other sessions have been signed out for security. Please log in with your new password.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">Plan • Track • Achieve</p>
            <p className="text-xs text-white/20 mt-1">© 2025 Revo. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Keyframes for animations */}
      <style jsx global>{`
        @keyframes scan {
          0% { left: -10%; opacity: 0; }
          20% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative glass-card p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-t-2xl" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
            <p className="text-sm text-white/50 mt-1">
              Create a new secure password for your Revo account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-2.5 pr-12 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all ${
                    showPassword 
                      ? 'border-orange-500/50 focus:border-orange-500/70 focus:ring-orange-500/20' 
                      : 'border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20'
                  }`}
                />
                <PortalRevealToggle 
                  revealed={showPassword} 
                  onToggle={togglePasswordVisibility}
                  scanning={scanningPassword}
                />
                {/* Scan line overlay */}
                {scanningPassword && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div 
                      className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
                      style={{
                        animation: 'scan 0.6s ease-out forwards',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/40 mb-2">Password must have:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <PasswordRequirement 
                      met={passwordValidation.minLength} 
                      label="8+ characters" 
                    />
                    <PasswordRequirement 
                      met={passwordValidation.hasUppercase} 
                      label="Uppercase" 
                    />
                    <PasswordRequirement 
                      met={passwordValidation.hasLowercase} 
                      label="Lowercase" 
                    />
                    <PasswordRequirement 
                      met={passwordValidation.hasNumber} 
                      label="Number" 
                    />
                    <PasswordRequirement 
                      met={passwordValidation.hasSpecial} 
                      label="Special char" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-2.5 pr-12 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/20'
                        : 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                      : showConfirmPassword 
                        ? 'border-orange-500/50 focus:border-orange-500/70 focus:ring-orange-500/20' 
                        : 'border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20'
                  }`}
                />
                <PortalRevealToggle 
                  revealed={showConfirmPassword} 
                  onToggle={toggleConfirmPasswordVisibility}
                  scanning={scanningConfirm}
                />
                {/* Scan line overlay */}
                {scanningConfirm && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div 
                      className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
                      style={{
                        animation: 'scan 0.6s ease-out forwards',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 mt-2 text-xs ${
                  passwordsMatch ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {passwordsMatch ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Passwords don&apos;t match
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating Password...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p className="text-xs text-white/40 leading-relaxed">
                After resetting your password, all sessions will be signed out for security. You&apos;ll need to log in with your new password.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">Plan • Track • Achieve</p>
            <p className="text-xs text-white/20 mt-1">© 2025 Revo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
