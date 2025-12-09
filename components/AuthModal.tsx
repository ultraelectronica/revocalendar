'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset' | 'verify';

const OTP_LENGTH = 8; // Supabase uses 8-digit codes

// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

// Unique "Portal Reveal" toggle component
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
          ? 'border-violet-500/80 shadow-[0_0_12px_rgba(139,92,246,0.5)]' 
          : 'border-white/20 group-hover:border-white/40'
      }`} />
      
      {/* Inner portal effect */}
      <div className={`absolute inset-1 rounded-full transition-all duration-500 overflow-hidden ${
        revealed ? 'bg-gradient-to-br from-violet-600/40 to-cyan-500/40' : 'bg-white/5'
      }`}>
        {/* Swirling animation when revealed */}
        {revealed && (
          <>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-violet-400/60 origin-bottom" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-cyan-400/60 origin-bottom rotate-90" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-violet-400/40 origin-bottom rotate-180" />
              <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-transparent to-cyan-400/40 origin-bottom -rotate-90" />
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
          // Open eye - seeing through the portal
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
          // Closed/sealed portal
          <>
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
            />
          </>
        )}
      </svg>

      {/* Scan line effect */}
      {scanning && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div 
            className="absolute h-full w-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-[scan_0.6s_ease-out]"
            style={{
              animation: 'scan 0.6s ease-out forwards',
            }}
          />
        </div>
      )}
    </button>
  );
}

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

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [scanningPassword, setScanningPassword] = useState(false);
  const [scanningConfirm, setScanningConfirm] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { signIn, signUp, signInWithGoogle, resetPassword, verifyOtp, resendOtp } = useAuth();

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setOtpCode(Array(OTP_LENGTH).fill(''));
      setError(null);
      setSuccess(null);
      setMode('signin');
      setResendCooldown(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Reset confirm password when switching modes
  useEffect(() => {
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pastedData.length > 0) {
      const newOtp = [...otpCode];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpCode(newOtp);
      const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation for signup
    if (mode === 'signup') {
      if (!isPasswordValid) {
        setError('Please meet all password requirements');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const { error, needsVerification } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else if (needsVerification) {
          setMode('verify');
          setResendCooldown(60);
          setSuccess(`We sent an ${OTP_LENGTH}-digit code to your email`);
        } else {
          onClose();
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for the reset link!');
        }
      } else if (mode === 'verify') {
        const code = otpCode.join('');
        if (code.length !== OTP_LENGTH) {
          setError(`Please enter the complete ${OTP_LENGTH}-digit code`);
          setLoading(false);
          return;
        }
        const { error } = await verifyOtp(email, code);
        if (error) {
          setError(error.message);
          setOtpCode(Array(OTP_LENGTH).fill(''));
          otpInputRefs.current[0]?.focus();
        } else {
          setSuccess('Account verified successfully!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    const { error } = await resendOtp(email);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('New code sent to your email');
      setResendCooldown(60);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Keyframes for scan animation */}
      <style jsx global>{`
        @keyframes scan {
          0% { left: -10%; opacity: 0; }
          20% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={mode !== 'verify' ? onClose : undefined}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md glass-card p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Close button (not on verify screen) */}
          {mode !== 'verify' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
              mode === 'verify' 
                ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' 
                : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20'
            }`}>
              {mode === 'verify' ? (
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
              {mode === 'verify' && 'Verify Your Email'}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              {mode === 'signin' && 'Sign in to sync your calendar'}
              {mode === 'signup' && 'Start organizing your life'}
              {mode === 'reset' && 'Enter your email to reset'}
              {mode === 'verify' && (
                <>Enter the {OTP_LENGTH}-digit code sent to <span className="text-cyan-400">{email}</span></>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'verify' ? (
              /* OTP Input */
              <div>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-9 h-12 sm:w-10 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg bg-white/5 border-2 border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                
                {/* Resend code */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className={`text-sm ${
                      resendCooldown > 0 
                        ? 'text-white/30 cursor-not-allowed' 
                        : 'text-cyan-400 hover:text-cyan-300'
                    } transition-colors`}
                  >
                    {resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : "Didn't receive the code? Resend"}
                  </button>
                </div>
              </div>
            ) : (
              /* Regular form inputs */
              <>
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                {mode !== 'reset' && (
                  <>
                    {/* Password field */}
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                        Password
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
                              ? 'border-violet-500/50 focus:border-violet-500/70 focus:ring-violet-500/20' 
                              : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                          }`}
                        />
                        <PortalRevealToggle 
                          revealed={showPassword} 
                          onToggle={togglePasswordVisibility}
                          scanning={scanningPassword}
                        />
                        {/* Scan line overlay for input */}
                        {scanningPassword && (
                          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                            <div 
                              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
                              style={{
                                animation: 'scan 0.6s ease-out forwards',
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Password requirements (only show on signup) */}
                      {mode === 'signup' && password.length > 0 && (
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

                    {/* Confirm Password field (only on signup) */}
                    {mode === 'signup' && (
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                          Confirm Password
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
                                  ? 'border-violet-500/50 focus:border-violet-500/70 focus:ring-violet-500/20' 
                                  : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                            }`}
                          />
                          <PortalRevealToggle 
                            revealed={showConfirmPassword} 
                            onToggle={toggleConfirmPasswordVisibility}
                            scanning={scanningConfirm}
                          />
                          {/* Scan line overlay for input */}
                          {scanningConfirm && (
                            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                              <div 
                                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
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
                    )}
                  </>
                )}
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || (mode === 'signup' && (!isPasswordValid || !passwordsMatch))}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Link'}
                  {mode === 'verify' && 'Verify Code'}
                </>
              )}
            </button>

            {/* Google Sign In - only show for signin and signup modes */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <div className="my-4 flex justify-center">
                  <span className="text-xs text-white/40">or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    const { error } = await signInWithGoogle();
                    if (error) setError(error.message);
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {/* Google Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="group-hover:text-white/90 transition-colors">
                    Continue with Google
                  </span>
                </button>
              </>
            )}
          </form>

          {/* Mode switcher */}
          {mode !== 'verify' && (
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => setMode('reset')}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                  <span className="mx-2 text-white/20">•</span>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Create account
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button
                  onClick={() => setMode('signin')}
                  className="text-white/50"
                >
                  Already have an account?{' '}
                  <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</span>
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('signin')}
                  className="text-white/50"
                >
                  Remember your password?{' '}
                  <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</span>
                </button>
              )}
            </div>
          )}

          {/* Back button for verify mode */}
          {mode === 'verify' && (
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  setMode('signup');
                  setOtpCode(Array(OTP_LENGTH).fill(''));
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to signup
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
