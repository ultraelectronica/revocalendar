'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens } from '@/lib/spotify';

// Store tokens in localStorage - will be synced to Supabase on main page
const SPOTIFY_TOKENS_KEY = 'spotify_pending_tokens';

function SpotifyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    // Handle OAuth errors
    if (errorParam) {
      setStatus('error');
      setError(errorParam === 'access_denied' ? 'Access was denied' : errorParam);
      return;
    }

    // No code received
    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      return;
    }

    // Get stored code verifier
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      setStatus('error');
      setError('Session expired. Please try connecting again from the main page.');
      return;
    }

    // Exchange code for tokens
    const processAuth = async () => {
      const startTime = Date.now();
      console.log('[Spotify] Starting auth process...');
      
      try {
        console.log('[Spotify] Exchanging code for tokens...');
        const tokens = await exchangeCodeForTokens(code, codeVerifier);
        console.log(`[Spotify] Token exchange completed in ${Date.now() - startTime}ms`);
        
        // Clear session data
        sessionStorage.removeItem('spotify_code_verifier');
        sessionStorage.removeItem('spotify_auth_timestamp');
        
        // Store tokens in localStorage (will be synced to Supabase on main page)
        localStorage.setItem(SPOTIFY_TOKENS_KEY, JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_at,
        }));
        
        console.log(`[Spotify] Tokens saved to localStorage in ${Date.now() - startTime}ms`);
        setStatus('success');
        
        // Full page navigation to ensure fresh state
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (err) {
        console.error('[Spotify] Auth error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
        
        // Clear session on error
        sessionStorage.removeItem('spotify_code_verifier');
        sessionStorage.removeItem('spotify_auth_timestamp');
      }
    };

    processAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#1DB954] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to Spotify</h2>
            <p className="text-white/50 text-sm">Exchanging authorization...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
            <p className="text-white/50 text-sm">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-red-400/80 text-sm mb-4 max-w-xs mx-auto">{error}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('spotify_code_verifier');
                sessionStorage.removeItem('spotify_auth_timestamp');
                router.push('/');
              }}
              className="px-6 py-2.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SpotifyCallbackContent />
    </Suspense>
  );
}
