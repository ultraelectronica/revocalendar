'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from '@/hooks/useEncryption';
import { useNotes } from '@/hooks/useNotes';
import NotesPage from '@/components/NotesPage';
import LandingPage from '@/components/LandingPage';

export default function NotesRoute() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  // Encryption hook
  const encryption = useEncryption();
  const { 
    isSetup: encryptionSetup, 
    isUnlocked: encryptionUnlocked, 
    isLoading: encryptionLoading,
    encrypt,
    decrypt,
    encryptFields,
    decryptFields,
  } = encryption;

  // Create encryption helpers object to pass to hooks
  const encryptionHelpers = useMemo(() => {
    if (!isAuthenticated) return null;
    return {
      encrypt,
      decrypt,
      encryptFields,
      decryptFields,
      isUnlocked: encryptionUnlocked,
    };
  }, [isAuthenticated, encrypt, decrypt, encryptFields, decryptFields, encryptionUnlocked]);

  // Notes hook
  const { 
    notes, 
    addNote,
    updateNote,
    updateNoteTitle,
    updateNoteBlocks,
    deleteNote,
    togglePinNote,
    setNoteColor,
    loading: notesLoading,
    syncing: notesSyncing,
  } = useNotes({ userId, encryption: encryptionHelpers });

  // Show landing page if not authenticated
  if (!isAuthenticated && !authLoading) {
    return <LandingPage />;
  }

  // Show loading state
  if (authLoading || notesLoading || encryptionLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <NotesPage
      notes={notes}
      onAddNote={addNote}
      onUpdateNote={updateNote}
      onUpdateNoteTitle={updateNoteTitle}
      onUpdateNoteBlocks={updateNoteBlocks}
      onDeleteNote={deleteNote}
      onTogglePin={togglePinNote}
      onSetColor={setNoteColor}
      onBack={() => router.push('/')}
      syncing={notesSyncing}
    />
  );
}
