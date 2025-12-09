'use client';

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import {
  generateSalt,
  deriveKey,
  createVerificationHash,
  verifyPassphrase,
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
} from '@/lib/crypto';

interface EncryptionState {
  isSetup: boolean;        // Has encryption been set up for this user
  isUnlocked: boolean;     // Is the encryption key currently available
  isLoading: boolean;
  error: string | null;
}

interface EncryptionContextType extends EncryptionState {
  setupEncryption: (passphrase: string) => Promise<{ error: string | null }>;
  unlockEncryption: (passphrase: string) => Promise<{ error: string | null }>;
  lockEncryption: () => void;
  encrypt: (value: string) => Promise<string>;
  decrypt: (value: string) => Promise<string>;
  encryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  decryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  hasEncryptionKey: boolean;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}

interface EncryptionProviderOptions {
  userId: string | null;
}

export function useEncryptionProvider({ userId }: EncryptionProviderOptions) {
  const [state, setState] = useState<EncryptionState>({
    isSetup: false,
    isUnlocked: false,
    isLoading: true,
    error: null,
  });

  const encryptionKeyRef = useRef<CryptoKey | null>(null);
  const saltRef = useRef<string | null>(null);
  const supabaseRef = useRef(createClient());

  const isMissingColumnError = (error: unknown) => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '42703'
    );
  };

  // Check if encryption is set up for this user
  useEffect(() => {
    if (!userId) {
      setState({
        isSetup: false,
        isUnlocked: false,
        isLoading: false,
        error: null,
      });
      encryptionKeyRef.current = null;
      saltRef.current = null;
      return;
    }

    const checkEncryptionSetup = async (retryCount = 0): Promise<void> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabaseRef.current
          .from('profiles')
          .select('encryption_salt, encryption_verification')
          .eq('id', userId)
          .single();

        if (error) {
          // Handle missing column error (migration not run)
          if (isMissingColumnError(error)) {
            setState(prev => ({
              ...prev,
              isSetup: false,
              isUnlocked: false,
              isLoading: false,
              error: null,
            }));
            return;
          }

          // Handle no rows returned (new user, profile not created yet)
          // PGRST116 is the error code for "no rows returned"
          if (error.code === 'PGRST116') {
            // For new OAuth users, the profile might not exist yet
            // Retry a few times with a delay
            if (retryCount < 3) {
              console.log(`[Encryption] Profile not found, retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/3)`);
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
              return checkEncryptionSetup(retryCount + 1);
            }
            
            // After retries, treat as not set up (new user without encryption)
            console.log('[Encryption] Profile not found after retries, treating as new user without encryption');
            setState(prev => ({
              ...prev,
              isSetup: false,
              isUnlocked: false,
              isLoading: false,
              error: null,
            }));
            return;
          }

          console.error('Error checking encryption setup:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to check encryption status',
          }));
          return;
        }

        const isSetup = !!(data?.encryption_salt && data?.encryption_verification);
        saltRef.current = data?.encryption_salt || null;

        setState(prev => ({
          ...prev,
          isSetup,
          isUnlocked: false,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error in checkEncryptionSetup:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check encryption status',
        }));
      }
    };

    checkEncryptionSetup();
  }, [userId]);

  // Set up encryption for a new user
  const setupEncryption = useCallback(async (passphrase: string): Promise<{ error: string | null }> => {
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    if (passphrase.length < 8) {
      return { error: 'Passphrase must be at least 8 characters' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate salt and verification hash
      const salt = generateSalt();
      const verificationHash = await createVerificationHash(passphrase, salt);

      // Store in database
      const { error: updateError } = await supabaseRef.current
        .from('profiles')
        .update({
          encryption_salt: salt,
          encryption_verification: verificationHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        if (isMissingColumnError(updateError)) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Encryption columns missing in profiles table. Please run the migration.' }));
          return { error: 'Encryption columns missing in profiles table. Please run the migration.' };
        }

        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to save encryption settings' }));
        return { error: 'Failed to save encryption settings' };
      }

      // Derive and store key in memory
      const key = await deriveKey(passphrase, salt);
      encryptionKeyRef.current = key;
      saltRef.current = salt;

      setState({
        isSetup: true,
        isUnlocked: true,
        isLoading: false,
        error: null,
      });

      return { error: null };
    } catch (err) {
      console.error('Error setting up encryption:', err);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to set up encryption' }));
      return { error: 'Failed to set up encryption' };
    }
  }, [userId]);

  // Unlock encryption with passphrase
  const unlockEncryption = useCallback(async (passphrase: string): Promise<{ error: string | null }> => {
    if (!userId || !saltRef.current) {
      return { error: 'Encryption not set up' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get verification hash from database
      const { data, error: fetchError } = await supabaseRef.current
        .from('profiles')
        .select('encryption_verification')
        .eq('id', userId)
        .single();

      if (fetchError || !data?.encryption_verification) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to verify passphrase' }));
        return { error: 'Failed to verify passphrase' };
      }

      // Verify passphrase
      const isValid = await verifyPassphrase(passphrase, saltRef.current, data.encryption_verification);

      if (!isValid) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Incorrect passphrase' }));
        return { error: 'Incorrect passphrase' };
      }

      // Derive key
      const key = await deriveKey(passphrase, saltRef.current);
      encryptionKeyRef.current = key;

      setState(prev => ({
        ...prev,
        isUnlocked: true,
        isLoading: false,
        error: null,
      }));

      return { error: null };
    } catch (err) {
      console.error('Error unlocking encryption:', err);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to unlock encryption' }));
      return { error: 'Failed to unlock encryption' };
    }
  }, [userId]);

  // Lock encryption (clear key from memory)
  const lockEncryption = useCallback(() => {
    encryptionKeyRef.current = null;
    setState(prev => ({ ...prev, isUnlocked: false }));
  }, []);

  // Encrypt a value
  const encryptValue = useCallback(async (value: string): Promise<string> => {
    if (!encryptionKeyRef.current) return value;
    return encrypt(value, encryptionKeyRef.current);
  }, []);

  // Decrypt a value
  const decryptValue = useCallback(async (value: string): Promise<string> => {
    if (!encryptionKeyRef.current) return value;
    return decrypt(value, encryptionKeyRef.current);
  }, []);

  // Encrypt fields in an object
  const encryptObjectFields = useCallback(async <T extends object>(
    obj: T,
    fields: (keyof T)[]
  ): Promise<T> => {
    if (!encryptionKeyRef.current) return obj;
    return encryptFields(obj, fields, encryptionKeyRef.current);
  }, []);

  // Decrypt fields in an object
  const decryptObjectFields = useCallback(async <T extends object>(
    obj: T,
    fields: (keyof T)[]
  ): Promise<T> => {
    if (!encryptionKeyRef.current) return obj;
    return decryptFields(obj, fields, encryptionKeyRef.current);
  }, []);

  return {
    ...state,
    setupEncryption,
    unlockEncryption,
    lockEncryption,
    encrypt: encryptValue,
    decrypt: decryptValue,
    encryptFields: encryptObjectFields,
    decryptFields: decryptObjectFields,
    hasEncryptionKey: !!encryptionKeyRef.current,
  };
}

export { EncryptionContext };
export type { EncryptionContextType };

