'use client';

import { ReactNode } from 'react';
import { EncryptionContext, useEncryptionProvider } from '@/hooks/useEncryption';
import { useAuth } from '@/hooks/useAuth';

interface EncryptionProviderProps {
  children: ReactNode;
}

export default function EncryptionProvider({ children }: EncryptionProviderProps) {
  const { user } = useAuth();
  const encryption = useEncryptionProvider({ userId: user?.id ?? null });

  return (
    <EncryptionContext.Provider value={encryption}>
      {children}
    </EncryptionContext.Provider>
  );
}

