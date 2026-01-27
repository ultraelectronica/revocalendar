import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '@/types';
import { loadNotes, saveNotes } from '@/utils/storageUtils';
import { createClient, DbNote } from '@/lib/supabase';

// Fields to encrypt in notes
const ENCRYPTED_NOTE_FIELDS: (keyof Note)[] = ['content'];

// Map database note to local Note type
function mapDbNoteToLocal(dbNote: DbNote): Note {
  return {
    id: dbNote.id,
    content: dbNote.content,
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at,
    pinned: dbNote.pinned,
    color: dbNote.color,
  };
}

interface EncryptionHelpers {
  encrypt: (value: string) => Promise<string>;
  decrypt: (value: string) => Promise<string>;
  encryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  decryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  isUnlocked: boolean;
}

interface UseNotesOptions {
  userId?: string | null;
  encryption?: EncryptionHelpers | null;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { userId, encryption } = options;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabaseRef = useRef(createClient());
  const hasMigratedRef = useRef(false);
  
  // Queue for pending database operations
  const pendingOpsRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Use ref for encryption to avoid dependency changes triggering refetch
  const encryptionRef = useRef(encryption);
  encryptionRef.current = encryption;

  // Encrypt note sensitive fields (using stable ref)
  const encryptNote = useCallback(async (note: Note): Promise<Note> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return note;
    return enc.encryptFields(note, ENCRYPTED_NOTE_FIELDS);
  }, []);

  // Decrypt note sensitive fields (using stable ref)
  const decryptNote = useCallback(async (note: Note): Promise<Note> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return note;
    return enc.decryptFields(note, ENCRYPTED_NOTE_FIELDS);
  }, []);

  // Decrypt multiple notes (using stable ref)
  const decryptNotes = useCallback(async (notes: Note[]): Promise<Note[]> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return notes;
    return Promise.all(notes.map(n => enc.decryptFields(n, ENCRYPTED_NOTE_FIELDS)));
  }, []);

  // Migrate localStorage data to Supabase (one-time)
  const migrateLocalToSupabase = useCallback(async (uid: string) => {
    if (hasMigratedRef.current) return;
    
    const supabase = supabaseRef.current;
    
    // Check if user already has notes in Supabase
    const { count } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid);

    if (count && count > 0) {
      hasMigratedRef.current = true;
      return;
    }

    // Load from localStorage
    const localNotes = loadNotes();
    
    if (localNotes.length > 0) {
      // Encrypt notes before migrating
      const encryptedNotes = await Promise.all(
        localNotes.map(async (n) => {
          const encrypted = await encryptNote(n);
          return {
            id: n.id,
            user_id: uid,
            content: encrypted.content,
            pinned: n.pinned,
            color: n.color,
            created_at: n.createdAt,
            updated_at: n.updatedAt,
          };
        })
      );
      
      await supabase.from('notes').insert(encryptedNotes);
      console.log(`Migrated ${localNotes.length} notes to Supabase`);
    }
    
    hasMigratedRef.current = true;
  }, [encryptNote]);

  // Fetch notes from Supabase or localStorage
  // Only refetch when userId changes, not when encryption changes
  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    const fetchNotes = async () => {
      if (!isMounted) return;
      setLoading(true);

      if (userId) {
        // Migrate localStorage data if needed
        await migrateLocalToSupabase(userId);

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (!error && data && isMounted) {
          const mappedNotes = data.map(mapDbNoteToLocal);
          const decryptedNotes = await decryptNotes(mappedNotes);
          if (isMounted) {
            setNotes(decryptedNotes);
          }
        }

        // Set up real-time subscription
        channel = supabase
          .channel(`notes-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notes',
              filter: `user_id=eq.${userId}`,
            },
            async (payload) => {
              if (!isMounted) return;
              if (payload.eventType === 'INSERT') {
                const mapped = mapDbNoteToLocal(payload.new as DbNote);
                const decrypted = await decryptNote(mapped);
                if (isMounted) {
                  setNotes(prev => [decrypted, ...prev]);
                }
              } else if (payload.eventType === 'UPDATE') {
                const mapped = mapDbNoteToLocal(payload.new as DbNote);
                const decrypted = await decryptNote(mapped);
                if (isMounted) {
                  setNotes(prev =>
                    prev.map(n => n.id === decrypted.id ? decrypted : n)
                  );
                }
              } else if (payload.eventType === 'DELETE') {
                if (isMounted) {
                  setNotes(prev => prev.filter(n => n.id !== (payload.old as DbNote).id));
                }
              }
            }
          )
          .subscribe();
      } else {
        // Fallback to localStorage for unauthenticated users
        if (isMounted) {
          setNotes(loadNotes());
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, migrateLocalToSupabase, decryptNotes, decryptNote]);

  const addNote = useCallback(async (content: string, color: string | null = null) => {
    const supabase = supabaseRef.current;
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const newNote: Note = {
      id,
      content,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      color,
    };

    // Optimistically add to UI immediately
    setNotes(prev => [newNote, ...prev]);

    if (userId) {
      // Save to database in background (non-blocking)
      (async () => {
        const opKey = `add-${id}`;
        if (pendingOpsRef.current.has(opKey)) return;
        
        pendingOpsRef.current.add(opKey);
        setSyncing(true);
        
        try {
          // Encrypt before saving
          const encryptedNote = await encryptNote(newNote);
          
          const { error } = await supabase
            .from('notes')
            .insert({
              id,
              user_id: userId,
              content: encryptedNote.content,
              pinned: false,
              color,
            })
            .select()
            .single();

          if (error) {
            // Rollback on error
            console.error('Failed to add note:', error);
            setNotes(prev => prev.filter(n => n.id !== id));
          }
        } catch (error) {
          console.error('Error adding note:', error);
          setNotes(prev => prev.filter(n => n.id !== id));
        } finally {
          pendingOpsRef.current.delete(opKey);
          setSyncing(pendingOpsRef.current.size > 0);
        }
      })();
    } else {
      // localStorage fallback
      const updatedNotes = [newNote, ...notes];
      saveNotes(updatedNotes);
    }
    
    return newNote;
  }, [userId, notes, encryptNote]);

  const updateNote = useCallback(async (noteId: string, content: string) => {
    const supabase = supabaseRef.current;
    const now = new Date().toISOString();

    // Optimistically update UI immediately
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? { ...note, content, updatedAt: now }
          : note
      )
    );

    if (userId) {
      // Clear existing debounce timer for this note
      const existingTimer = debounceTimersRef.current.get(noteId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Debounce rapid sequential updates (300ms)
      const timer = setTimeout(async () => {
        debounceTimersRef.current.delete(noteId);
        
        // Check if operation is already pending
        if (pendingOpsRef.current.has(noteId)) {
          return;
        }
        
        pendingOpsRef.current.add(noteId);
        setSyncing(true);
        
        try {
          // Get current content from state (may have changed during debounce)
          const currentNote = notes.find(n => n.id === noteId);
          const contentToSave = currentNote?.content || content;
          
          // Encrypt content before saving
          const encryptedContent = encryption?.isUnlocked 
            ? await encryption.encrypt(contentToSave)
            : contentToSave;
          
          const { error } = await supabase
            .from('notes')
            .update({
              content: encryptedContent,
              updated_at: new Date().toISOString(),
            })
            .eq('id', noteId)
            .eq('user_id', userId);

          if (error) {
            // Rollback on error - revert to previous state
            console.error('Failed to update note:', error);
            // Note: In production, you might want to fetch the latest from server
            // For now, we keep the optimistic update as the user's intent
          }
        } catch (error) {
          console.error('Error updating note:', error);
        } finally {
          pendingOpsRef.current.delete(noteId);
          setSyncing(pendingOpsRef.current.size > 0);
        }
      }, 300);

      debounceTimersRef.current.set(noteId, timer);
    } else {
      // localStorage fallback - save immediately
      const updatedNotes = notes.map(note =>
        note.id === noteId
          ? { ...note, content, updatedAt: now }
          : note
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  }, [userId, notes, encryption]);

  const deleteNote = useCallback(async (noteId: string) => {
    const supabase = supabaseRef.current;
    
    // Store note for potential rollback
    const noteToDelete = notes.find(n => n.id === noteId);
    
    // Optimistically remove from UI immediately
    setNotes(prev => prev.filter(note => note.id !== noteId));

    if (userId) {
      // Save to database in background (non-blocking)
      (async () => {
        const opKey = `delete-${noteId}`;
        if (pendingOpsRef.current.has(opKey)) return;
        
        pendingOpsRef.current.add(opKey);
        setSyncing(true);
        
        try {
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', userId);

          if (error) {
            // Rollback on error
            console.error('Failed to delete note:', error);
            if (noteToDelete) {
              setNotes(prev => [...prev, noteToDelete]);
            }
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          if (noteToDelete) {
            setNotes(prev => [...prev, noteToDelete]);
          }
        } finally {
          pendingOpsRef.current.delete(opKey);
          setSyncing(pendingOpsRef.current.size > 0);
        }
      })();
    } else {
      // localStorage fallback
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  const togglePinNote = useCallback(async (noteId: string) => {
    const supabase = supabaseRef.current;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newPinned = !note.pinned;

    // Optimistically update UI immediately
    setNotes(prev =>
      prev.map(n =>
        n.id === noteId ? { ...n, pinned: newPinned } : n
      )
    );

    if (userId) {
      // Save to database in background (non-blocking)
      (async () => {
        const opKey = `pin-${noteId}`;
        if (pendingOpsRef.current.has(opKey)) return;
        
        pendingOpsRef.current.add(opKey);
        setSyncing(true);
        
        try {
          const { error } = await supabase
            .from('notes')
            .update({ pinned: newPinned })
            .eq('id', noteId)
            .eq('user_id', userId);

          if (error) {
            // Rollback on error
            console.error('Failed to toggle pin:', error);
            setNotes(prev =>
              prev.map(n =>
                n.id === noteId ? { ...n, pinned: note.pinned } : n
              )
            );
          }
        } catch (error) {
          console.error('Error toggling pin:', error);
          setNotes(prev =>
            prev.map(n =>
              n.id === noteId ? { ...n, pinned: note.pinned } : n
            )
          );
        } finally {
          pendingOpsRef.current.delete(opKey);
          setSyncing(pendingOpsRef.current.size > 0);
        }
      })();
    } else {
      // localStorage fallback
      const updatedNotes = notes.map(n =>
        n.id === noteId ? { ...n, pinned: newPinned } : n
      );
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  const setNoteColor = useCallback(async (noteId: string, color: string | null) => {
    const supabase = supabaseRef.current;
    const note = notes.find(n => n.id === noteId);
    const previousColor = note?.color ?? null;

    // Optimistically update UI immediately
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId ? { ...note, color } : note
      )
    );

    if (userId) {
      // Save to database in background (non-blocking)
      (async () => {
        const opKey = `color-${noteId}`;
        if (pendingOpsRef.current.has(opKey)) return;
        
        pendingOpsRef.current.add(opKey);
        setSyncing(true);
        
        try {
          const { error } = await supabase
            .from('notes')
            .update({ color })
            .eq('id', noteId)
            .eq('user_id', userId);

          if (error) {
            // Rollback on error
            console.error('Failed to set note color:', error);
            setNotes(prev =>
              prev.map(note =>
                note.id === noteId ? { ...note, color: previousColor } : note
              )
            );
          }
        } catch (error) {
          console.error('Error setting note color:', error);
          setNotes(prev =>
            prev.map(note =>
              note.id === noteId ? { ...note, color: previousColor } : note
            )
          );
        } finally {
          pendingOpsRef.current.delete(opKey);
          setSyncing(pendingOpsRef.current.size > 0);
        }
      })();
    } else {
      // localStorage fallback
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, color } : note
      );
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return {
    notes: sortedNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    setNoteColor,
    loading,
    syncing,
  };
}
