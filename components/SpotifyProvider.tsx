'use client';

import { ReactNode } from 'react';
import { SpotifyContext, useSpotifyProvider } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';

interface SpotifyProviderProps {
  children: ReactNode;
}

export default function SpotifyProvider({ children }: SpotifyProviderProps) {
  const { user } = useAuth();
  const spotify = useSpotifyProvider({ userId: user?.id ?? null });

  return (
    <SpotifyContext.Provider value={spotify}>
      {children}
    </SpotifyContext.Provider>
  );
}

