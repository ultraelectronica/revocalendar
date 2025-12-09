'use client';

import { useState, useEffect } from 'react';
import { useEncryption } from '@/hooks/useEncryption';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EncryptionModal({ isOpen, onClose, onSuccess }: EncryptionModalProps) {
  const { isSetup, isLoading, setupEncryption, unlockEncryption } = useEncryption();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);

  const isSettingUp = !isSetup;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassphrase('');
      setConfirmPassphrase('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSettingUp) {
      // Setting up encryption for the first time
      if (passphrase.length < 8) {
        setError('Passphrase must be at least 8 characters');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError('Passphrases do not match');
        return;
      }

      const { error: setupError } = await setupEncryption(passphrase);
      if (setupError) {
        setError(setupError);
      } else {
        onSuccess();
      }
    } else {
      // Unlocking existing encryption
      const { error: unlockError } = await unlockEncryption(passphrase);
      if (unlockError) {
        setError(unlockError);
      } else {
        onSuccess();
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isSettingUp ? 'Set Up Encryption' : 'Unlock Your Data'}
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-sm mx-auto">
            {isSettingUp 
              ? 'Create a passphrase to encrypt your sensitive data. This passphrase is never stored and cannot be recovered.'
              : 'Enter your passphrase to decrypt your calendar data.'}
          </p>
        </div>

        {/* Warning for setup */}
        {isSettingUp && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs text-amber-300 font-medium">Important</p>
                <p className="text-xs text-amber-300/70 mt-0.5">
                  If you forget this passphrase, your encrypted data cannot be recovered. Write it down somewhere safe!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
              {isSettingUp ? 'Create Passphrase' : 'Passphrase'}
            </label>
            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={isSettingUp ? 'Enter a strong passphrase' : 'Enter your passphrase'}
                required
                minLength={isSettingUp ? 8 : 1}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassphrase ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {isSettingUp && (
              <p className="text-[10px] text-white/30 mt-1.5">
                Minimum 8 characters. Use a mix of letters, numbers, and symbols.
              </p>
            )}
          </div>

          {isSettingUp && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                Confirm Passphrase
              </label>
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Confirm your passphrase"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isSettingUp && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Skip for Now
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`${isSettingUp ? 'flex-1' : 'w-full'} py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : isSettingUp ? (
                'Enable Encryption'
              ) : (
                'Unlock'
              )}
            </button>
          </div>
        </form>

        {/* Info footer */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30">
            🔒 End-to-end encryption • Your passphrase never leaves your device
          </p>
        </div>
      </div>
    </div>
  );
}

