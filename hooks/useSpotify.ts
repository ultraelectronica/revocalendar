'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase';
import {
  SpotifyAPI,
  SpotifyUser,
  SpotifyPlaybackState,
  SpotifyTrack,
  SpotifyDevice,
  SpotifyRecentTrack,
  SpotifyTokens,
  getSpotifyAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  extractDominantColor,
  getMoodFromFeatures,
  formatDuration,
} from '@/lib/spotify';

interface SpotifyState {
  isConnected: boolean;
  isLoading: boolean;
  isPremium: boolean;
  user: SpotifyUser | null;
  playbackState: SpotifyPlaybackState | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  devices: SpotifyDevice[];
  recentTracks: SpotifyRecentTrack[];
  dominantColor: string;
  mood: { mood: string; color: string; emoji: string } | null;
  isLiked: boolean;
  error: string | null;
}

interface SpotifyContextType extends SpotifyState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeat: () => Promise<void>;
  toggleLike: () => Promise<void>;
  transferToDevice: (deviceId: string) => Promise<void>;
  refreshPlayback: () => Promise<void>;
  formatTime: (ms: number) => string;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}

interface SpotifyProviderOptions {
  userId: string | null;
}

export function useSpotifyProvider({ userId }: SpotifyProviderOptions) {
  const [state, setState] = useState<SpotifyState>({
    isConnected: false,
    isLoading: true,
    isPremium: false,
    user: null,
    playbackState: null,
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 50,
    shuffle: false,
    repeat: 'off',
    devices: [],
    recentTracks: [],
    dominantColor: '#06b6d4',
    mood: null,
    isLiked: false,
    error: null,
  });

  const tokensRef = useRef<SpotifyTokens | null>(null);
  const apiRef = useRef<SpotifyAPI | null>(null);
  const supabaseRef = useRef(createClient());
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializingRef = useRef(false); // Prevent concurrent initialization

  // Local storage key for tokens (fallback when Supabase table doesn't exist)
  const TOKENS_STORAGE_KEY = 'spotify_tokens';
  const PENDING_TOKENS_KEY = 'spotify_pending_tokens';

  // Check for pending tokens from OAuth callback (stored in localStorage)
  const checkPendingTokens = useCallback((): SpotifyTokens | null => {
    try {
      const pending = localStorage.getItem(PENDING_TOKENS_KEY);
      if (pending) {
        const tokens = JSON.parse(pending) as SpotifyTokens;
        localStorage.removeItem(PENDING_TOKENS_KEY); // Clear after reading
        // Also save to regular storage as backup
        localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
        console.log('[Spotify] Found pending tokens from OAuth callback');
        return tokens;
      }
    } catch {
      localStorage.removeItem(PENDING_TOKENS_KEY);
    }
    return null;
  }, []);

  // Load tokens from localStorage (primary) or Supabase (backup sync)
  const loadTokens = useCallback(async () => {
    // First check for pending tokens from OAuth callback
    const pendingTokens = checkPendingTokens();
    if (pendingTokens) {
      // Try to sync to Supabase in background (don't block on it)
      if (userId) {
        (async () => {
          try {
            await supabaseRef.current
              .from('spotify_tokens')
              .upsert({
                user_id: userId,
                access_token: pendingTokens.access_token,
                refresh_token: pendingTokens.refresh_token,
                expires_at: new Date(pendingTokens.expires_at).toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
            console.log('[Spotify] Tokens synced to Supabase');
          } catch {
            console.log('[Spotify] Supabase sync skipped (table may not exist)');
          }
        })();
      }
      return pendingTokens;
    }

    // Check localStorage first (faster, works without Supabase table)
    try {
      const stored = localStorage.getItem(TOKENS_STORAGE_KEY);
      if (stored) {
        const tokens = JSON.parse(stored) as SpotifyTokens;
        // Validate tokens haven't expired completely (refresh token should still work)
        if (tokens.access_token && tokens.refresh_token) {
          console.log('[Spotify] Loaded tokens from localStorage');
          return tokens;
        }
      }
    } catch {
      localStorage.removeItem(TOKENS_STORAGE_KEY);
    }

    // Fallback: try Supabase (only once, don't retry on error)
    if (userId) {
      try {
        const { data, error } = await supabaseRef.current
          .from('spotify_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          const tokens = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: new Date(data.expires_at).getTime(),
          } as SpotifyTokens;
          // Cache to localStorage
          localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
          return tokens;
        }
      } catch {
        // Supabase table might not exist, that's okay
      }
    }

    return null;
  }, [userId, checkPendingTokens]);

  // Save tokens to localStorage (primary) and Supabase (background sync)
  const saveTokens = useCallback(async (tokens: SpotifyTokens) => {
    // Always save to localStorage (primary storage)
    try {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } catch (err) {
      console.error('Failed to save tokens to localStorage:', err);
    }

    // Sync to Supabase in background (don't block)
    if (userId) {
      (async () => {
        try {
          await supabaseRef.current
            .from('spotify_tokens')
            .upsert({
              user_id: userId,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: new Date(tokens.expires_at).toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch {
          // Silently fail if table doesn't exist
        }
      })();
    }
  }, [userId]);

  // Delete tokens from localStorage and Supabase
  const deleteTokens = useCallback(async () => {
    // Clear localStorage
    localStorage.removeItem(TOKENS_STORAGE_KEY);
    localStorage.removeItem(PENDING_TOKENS_KEY);

    // Clear Supabase (background, don't block)
    if (userId) {
      (async () => {
        try {
          await supabaseRef.current
            .from('spotify_tokens')
            .delete()
            .eq('user_id', userId);
        } catch {
          // Silently fail if table doesn't exist
        }
      })();
    }
  }, [userId]);

  // Get valid access token (refresh if needed)
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!tokensRef.current) return null;

    // Check if token is expired (with 5 minute buffer)
    if (tokensRef.current.expires_at < Date.now() + 5 * 60 * 1000) {
      try {
        const newTokens = await refreshAccessToken(tokensRef.current.refresh_token);
        tokensRef.current = newTokens;
        apiRef.current = new SpotifyAPI(newTokens.access_token);
        await saveTokens(newTokens);
      } catch (err) {
        console.error('Failed to refresh token:', err);
        return null;
      }
    }

    return tokensRef.current.access_token;
  }, [saveTokens]);

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    const token = await getValidToken();
    if (!token || !apiRef.current) return;

    try {
      const user = await apiRef.current.getMe();
      setState(prev => ({
        ...prev,
        user,
        isPremium: user.product === 'premium',
      }));
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, [getValidToken]);

  // Fetch playback state
  const fetchPlayback = useCallback(async () => {
    const token = await getValidToken();
    if (!token || !apiRef.current) return;

    try {
      const playbackState = await apiRef.current.getPlaybackState();
      
      if (playbackState && playbackState.item) {
        const track = playbackState.item;
        
        // Check if track is liked
        const [isLiked] = await apiRef.current.checkSavedTracks([track.id]);
        
        // Get audio features for mood
        let mood = state.mood;
        if (!state.currentTrack || state.currentTrack.id !== track.id) {
          try {
            const features = await apiRef.current.getAudioFeatures(track.id);
            mood = getMoodFromFeatures(features);
          } catch {
            mood = null;
          }
          
          // Extract dominant color from album art
          if (track.album.images[0]) {
            extractDominantColor(track.album.images[0].url).then(color => {
              setState(prev => ({ ...prev, dominantColor: color }));
            });
          }
        }

        setState(prev => ({
          ...prev,
          playbackState,
          currentTrack: track,
          isPlaying: playbackState.is_playing,
          progress: playbackState.progress_ms,
          duration: track.duration_ms,
          volume: playbackState.device?.volume_percent ?? 50,
          shuffle: playbackState.shuffle_state,
          repeat: playbackState.repeat_state,
          mood,
          isLiked,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          playbackState: null,
          currentTrack: null,
          isPlaying: false,
          progress: 0,
          duration: 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch playback:', err);
    }
  }, [getValidToken, state.currentTrack, state.mood]);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    const token = await getValidToken();
    if (!token || !apiRef.current) return;

    try {
      const { devices } = await apiRef.current.getDevices();
      setState(prev => ({ ...prev, devices }));
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  }, [getValidToken]);

  // Fetch recently played
  const fetchRecentlyPlayed = useCallback(async () => {
    const token = await getValidToken();
    if (!token || !apiRef.current) return;

    try {
      const { items } = await apiRef.current.getRecentlyPlayed(10);
      setState(prev => ({ ...prev, recentTracks: items }));
    } catch (err) {
      console.error('Failed to fetch recently played:', err);
    }
  }, [getValidToken]);

  // Initialize Spotify connection
  const initializeSpotify = useCallback(async () => {
    // Prevent concurrent initialization
    if (initializingRef.current) return;
    initializingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const tokens = await loadTokens();
      if (tokens) {
        tokensRef.current = tokens;
        apiRef.current = new SpotifyAPI(tokens.access_token);

        const validToken = await getValidToken();
        if (validToken) {
          setState(prev => ({ ...prev, isConnected: true }));
          await fetchUser();
          await fetchPlayback();
          await fetchDevices();
          await fetchRecentlyPlayed();
        }
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      initializingRef.current = false;
    }
  }, [loadTokens, getValidToken, fetchUser, fetchPlayback, fetchDevices, fetchRecentlyPlayed]);

  // Initialize on userId change
  useEffect(() => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false, isConnected: false }));
      return;
    }

    initializeSpotify();
  }, [userId, initializeSpotify]);

  // Watch for pending tokens (from OAuth callback redirect)
  useEffect(() => {
    // Check immediately on mount
    const checkPending = () => {
      const hasPending = localStorage.getItem('spotify_pending_tokens');
      if (hasPending && !state.isConnected) {
        console.log('[Spotify] Detected pending tokens, initializing...');
        initializeSpotify();
        return true;
      }
      return false;
    };

    // Check now
    if (checkPending()) return;

    // Check again shortly after mount (handles redirect timing)
    const timeout = setTimeout(checkPending, 100);

    // Listen for visibility changes (user returning from Spotify auth tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPending();
      }
    };

    // Listen for focus (another way to detect return)
    const handleFocus = () => checkPending();

    // Also listen for storage events (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'spotify_pending_tokens' && e.newValue) {
        console.log('[Spotify] Storage event: pending tokens detected');
        initializeSpotify();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [state.isConnected, initializeSpotify]);

  // Progress timer
  useEffect(() => {
    if (state.isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 1000, prev.duration),
        }));
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying]);

  // Playback polling (every 5 seconds when playing)
  useEffect(() => {
    if (state.isConnected && state.isPlaying) {
      playbackIntervalRef.current = setInterval(fetchPlayback, 5000);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [state.isConnected, state.isPlaying, fetchPlayback]);

  // Connect to Spotify
  const connect = useCallback(async () => {
    try {
      // Clear any previous auth attempt data
      sessionStorage.removeItem('spotify_code_verifier');
      sessionStorage.removeItem('spotify_auth_timestamp');
      
      const { url, codeVerifier } = await getSpotifyAuthUrl();
      
      // Store code verifier and timestamp in sessionStorage for callback
      sessionStorage.setItem('spotify_code_verifier', codeVerifier);
      sessionStorage.setItem('spotify_auth_timestamp', Date.now().toString());
      
      // Redirect to Spotify
      window.location.href = url;
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to connect to Spotify' }));
    }
  }, []);

  // Handle callback (call this from the callback page)
  const handleCallback = useCallback(async (code: string) => {
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    tokensRef.current = tokens;
    apiRef.current = new SpotifyAPI(tokens.access_token);
    
    await saveTokens(tokens);
    sessionStorage.removeItem('spotify_code_verifier');

    setState(prev => ({ ...prev, isConnected: true }));
    await fetchUser();
    await fetchPlayback();
    await fetchDevices();
  }, [saveTokens, fetchUser, fetchPlayback, fetchDevices]);

  // Disconnect from Spotify
  const disconnect = useCallback(async () => {
    tokensRef.current = null;
    apiRef.current = null;
    await deleteTokens();

    setState({
      isConnected: false,
      isLoading: false,
      isPremium: false,
      user: null,
      playbackState: null,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: 50,
      shuffle: false,
      repeat: 'off',
      devices: [],
      recentTracks: [],
      dominantColor: '#06b6d4',
      mood: null,
      isLiked: false,
      error: null,
    });
  }, [deleteTokens]);

  // Playback controls
  const play = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to play' }));
    }
  }, []);

  const pause = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to pause' }));
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const next = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.next();
      setTimeout(fetchPlayback, 500);
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to skip' }));
    }
  }, [fetchPlayback]);

  const previous = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.previous();
      setTimeout(fetchPlayback, 500);
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to go back' }));
    }
  }, [fetchPlayback]);

  const seek = useCallback(async (positionMs: number) => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.seek(positionMs);
      setState(prev => ({ ...prev, progress: positionMs }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to seek' }));
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.setVolume(Math.round(volume));
      setState(prev => ({ ...prev, volume }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to set volume' }));
    }
  }, []);

  const toggleShuffle = useCallback(async () => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.setShuffle(!state.shuffle);
      setState(prev => ({ ...prev, shuffle: !prev.shuffle }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to toggle shuffle' }));
    }
  }, [state.shuffle]);

  const cycleRepeat = useCallback(async () => {
    if (!apiRef.current) return;
    const nextState = state.repeat === 'off' ? 'context' : state.repeat === 'context' ? 'track' : 'off';
    try {
      await apiRef.current.setRepeat(nextState);
      setState(prev => ({ ...prev, repeat: nextState }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to set repeat' }));
    }
  }, [state.repeat]);

  const toggleLike = useCallback(async () => {
    if (!apiRef.current || !state.currentTrack) return;
    try {
      if (state.isLiked) {
        await apiRef.current.removeTrack(state.currentTrack.id);
      } else {
        await apiRef.current.saveTrack(state.currentTrack.id);
      }
      setState(prev => ({ ...prev, isLiked: !prev.isLiked }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to update library' }));
    }
  }, [state.currentTrack, state.isLiked]);

  const transferToDevice = useCallback(async (deviceId: string) => {
    if (!apiRef.current) return;
    try {
      await apiRef.current.transferPlayback(deviceId, state.isPlaying);
      await fetchDevices();
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to transfer playback' }));
    }
  }, [state.isPlaying, fetchDevices]);

  const refreshPlayback = useCallback(async () => {
    await fetchPlayback();
    await fetchDevices();
  }, [fetchPlayback, fetchDevices]);

  return {
    ...state,
    connect,
    disconnect,
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    transferToDevice,
    refreshPlayback,
    formatTime: formatDuration,
    // Expose handleCallback for the callback route
    handleCallback,
  };
}

export { SpotifyContext };
export type { SpotifyContextType };

