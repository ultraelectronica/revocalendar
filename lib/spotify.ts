// Spotify API configuration and utilities

// Redirect URI must be configured in .env.local and match exactly in Spotify Dashboard
// For local dev: http://127.0.0.1:3000/auth/spotify/callback
// For production: https://yourdomain.com/auth/spotify/callback
function getSpotifyRedirectUri(): string {
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || process.env.NEXT_PUBLIC_LOCAL_SPOTIFY_REDIRECT_URI;
  
  if (!redirectUri) {
    throw new Error(
      'Spotify redirect URI is not configured. Please set NEXT_PUBLIC_SPOTIFY_REDIRECT_URI or NEXT_PUBLIC_LOCAL_SPOTIFY_REDIRECT_URI in your .env.local file.'
    );
  }
  
  return redirectUri;
}

export const SPOTIFY_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
  get redirectUri(): string {
    return getSpotifyRedirectUri();
  },
  scopes: [
    // Playback
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    // User
    'user-read-email',
    'user-read-private',
    // Library
    'user-library-read',
    'user-library-modify',
    // Playlists
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    // History
    'user-read-recently-played',
    'user-top-read',
  ].join(' '),
};

// Spotify API types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  product: 'free' | 'premium';
  country: string;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  release_date: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: { spotify: string };
  preview_url: string | null;
  popularity: number;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device: {
    id: string;
    name: string;
    type: string;
    volume_percent: number;
    is_active: boolean;
  } | null;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  context: {
    type: 'album' | 'artist' | 'playlist';
    uri: string;
  } | null;
  timestamp: number;
}

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  volume_percent: number;
}

export interface SpotifyRecentTrack {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    uri: string;
  } | null;
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Generate random string for PKCE
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate code verifier for PKCE
export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Build Spotify authorization URL
export async function getSpotifyAuthUrl(): Promise<{ url: string; codeVerifier: string }> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    scope: SPOTIFY_CONFIG.scopes,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
  });

  return {
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    codeVerifier,
  };
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<SpotifyTokens> {
  const redirectUri = SPOTIFY_CONFIG.redirectUri;
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error_description || errorData.error || `HTTP ${response.status}`;
    
    // Common error explanations
    if (errorData.error === 'invalid_grant') {
      throw new Error(
        `Spotify auth failed: ${errorMsg}. This usually means the redirect URI doesn't match exactly. ` +
        `Expected: ${redirectUri}. Make sure this exact URI is registered in your Spotify Dashboard.`
      );
    }
    
    throw new Error(`Spotify auth failed: ${errorMsg}`);
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// Spotify API class
export class SpotifyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  // User
  async getMe(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me');
  }

  // Playback
  async getPlaybackState(): Promise<SpotifyPlaybackState | null> {
    try {
      return await this.fetch<SpotifyPlaybackState>('/me/player');
    } catch {
      return null;
    }
  }

  async getCurrentlyPlaying(): Promise<SpotifyPlaybackState | null> {
    try {
      return await this.fetch<SpotifyPlaybackState>('/me/player/currently-playing');
    } catch {
      return null;
    }
  }

  async play(options?: { uris?: string[]; context_uri?: string; position_ms?: number }): Promise<void> {
    await this.fetch('/me/player/play', {
      method: 'PUT',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  async pause(): Promise<void> {
    await this.fetch('/me/player/pause', { method: 'PUT' });
  }

  async next(): Promise<void> {
    await this.fetch('/me/player/next', { method: 'POST' });
  }

  async previous(): Promise<void> {
    await this.fetch('/me/player/previous', { method: 'POST' });
  }

  async seek(positionMs: number): Promise<void> {
    await this.fetch(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });
  }

  async setVolume(volumePercent: number): Promise<void> {
    await this.fetch(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });
  }

  async setShuffle(state: boolean): Promise<void> {
    await this.fetch(`/me/player/shuffle?state=${state}`, { method: 'PUT' });
  }

  async setRepeat(state: 'off' | 'track' | 'context'): Promise<void> {
    await this.fetch(`/me/player/repeat?state=${state}`, { method: 'PUT' });
  }

  async getDevices(): Promise<{ devices: SpotifyDevice[] }> {
    return this.fetch('/me/player/devices');
  }

  async transferPlayback(deviceId: string, play = false): Promise<void> {
    await this.fetch('/me/player', {
      method: 'PUT',
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  }

  // Library
  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    return this.fetch(`/me/tracks/contains?ids=${trackIds.join(',')}`);
  }

  async saveTrack(trackId: string): Promise<void> {
    await this.fetch(`/me/tracks?ids=${trackId}`, { method: 'PUT' });
  }

  async removeTrack(trackId: string): Promise<void> {
    await this.fetch(`/me/tracks?ids=${trackId}`, { method: 'DELETE' });
  }

  // Recently played
  async getRecentlyPlayed(limit = 20): Promise<{ items: SpotifyRecentTrack[] }> {
    return this.fetch(`/me/player/recently-played?limit=${limit}`);
  }

  // Track features (for mood detection)
  async getAudioFeatures(trackId: string): Promise<{
    danceability: number;
    energy: number;
    valence: number;
    tempo: number;
    acousticness: number;
    instrumentalness: number;
  }> {
    return this.fetch(`/audio-features/${trackId}`);
  }

  // Search
  async search(query: string, types: string[] = ['track'], limit = 20): Promise<{
    tracks?: { items: SpotifyTrack[] };
  }> {
    return this.fetch(`/search?q=${encodeURIComponent(query)}&type=${types.join(',')}&limit=${limit}`);
  }
}

// Extract dominant color from album art (for mood-based UI)
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('#06b6d4'); // Default cyan
        return;
      }
      
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      
      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let i = 0; i < imageData.length; i += 4) {
        // Skip very dark and very light pixels
        const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
        if (brightness > 30 && brightness < 220) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }
      }
      
      if (count === 0) {
        resolve('#06b6d4');
        return;
      }
      
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => resolve('#06b6d4');
    img.src = imageUrl;
  });
}

// Get mood from audio features
export function getMoodFromFeatures(features: {
  valence: number;
  energy: number;
  danceability: number;
}): { mood: string; color: string; emoji: string } {
  const { valence, energy, danceability } = features;
  
  if (valence > 0.7 && energy > 0.7) {
    return { mood: 'Euphoric', color: '#fbbf24', emoji: '🔥' };
  } else if (valence > 0.6 && danceability > 0.7) {
    return { mood: 'Groovy', color: '#a855f7', emoji: '💃' };
  } else if (valence > 0.5 && energy > 0.5) {
    return { mood: 'Happy', color: '#22c55e', emoji: '😊' };
  } else if (valence < 0.3 && energy > 0.7) {
    return { mood: 'Intense', color: '#ef4444', emoji: '⚡' };
  } else if (valence < 0.3 && energy < 0.4) {
    return { mood: 'Melancholic', color: '#6366f1', emoji: '🌙' };
  } else if (energy < 0.4) {
    return { mood: 'Chill', color: '#06b6d4', emoji: '😌' };
  } else if (danceability > 0.7) {
    return { mood: 'Funky', color: '#f97316', emoji: '🎵' };
  } else {
    return { mood: 'Balanced', color: '#8b5cf6', emoji: '✨' };
  }
}

// Format duration
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

