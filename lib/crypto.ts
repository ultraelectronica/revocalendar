const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// Prefix for encrypted data to identify it
const ENCRYPTED_PREFIX = 'enc:';

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer);
}

/**
 * Derive an encryption key from a passphrase and salt using PBKDF2
 */
export async function deriveKey(passphrase: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBuffer = base64ToArrayBuffer(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Create a verification hash to check if passphrase is correct
 * This is stored in the database to verify the passphrase on subsequent logins
 */
export async function createVerificationHash(passphrase: string, salt: string): Promise<string> {
  const key = await deriveKey(passphrase, salt);
  const encoder = new TextEncoder();
  const testData = encoder.encode('verification_test_string');
  
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    testData
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return arrayBufferToBase64(combined.buffer);
}

/**
 * Verify a passphrase against a stored verification hash
 */
export async function verifyPassphrase(
  passphrase: string, 
  salt: string, 
  verificationHash: string
): Promise<boolean> {
  try {
    const key = await deriveKey(passphrase, salt);
    const combined = new Uint8Array(base64ToArrayBuffer(verificationHash));
    
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted) === 'verification_test_string';
  } catch {
    return false;
  }
}

/**
 * Encrypt a string value
 * Returns the encrypted value with prefix, or original if encryption fails
 */
export async function encrypt(value: string, key: CryptoKey): Promise<string> {
  if (!value || !key) return value;
  
  try {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(value)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return ENCRYPTED_PREFIX + arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    return value;
  }
}

/**
 * Decrypt an encrypted string value
 * Returns the decrypted value, or original if decryption fails
 */
export async function decrypt(value: string, key: CryptoKey): Promise<string> {
  if (!value || !key) return value;
  
  // Check if value is encrypted
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    return value; // Not encrypted, return as-is
  }
  
  try {
    const encryptedData = value.slice(ENCRYPTED_PREFIX.length);
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedData));
    
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Encrypted - Wrong Key]';
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  return value?.startsWith(ENCRYPTED_PREFIX) ?? false;
}

/**
 * Encrypt multiple fields in an object
 */
export async function encryptFields<T extends object>(
  obj: T,
  fields: (keyof T)[],
  key: CryptoKey
): Promise<T> {
  const result = { ...obj } as T;
  
  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[field] = await encrypt(value, key);
    }
  }
  
  return result;
}

/**
 * Decrypt multiple fields in an object
 */
export async function decryptFields<T extends object>(
  obj: T,
  fields: (keyof T)[],
  key: CryptoKey
): Promise<T> {
  const result = { ...obj } as T;
  
  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[field] = await decrypt(value, key);
    }
  }
  
  return result;
}

// Storage keys for encryption data
export const ENCRYPTION_STORAGE_KEYS = {
  KEY_CHECK: 'revo_encryption_key_check',
} as const;

