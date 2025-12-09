import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '@/types';
import { loadNotes, saveNotes } from '@/utils/storageUtils';
import { createClient, DbNote } from '@/lib/supabase';

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

interface UseNotesOptions {
  userId?: string | null;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { userId } = options;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabaseRef = useRef(createClient());
  const hasMigratedRef = useRef(false);

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
      const dbNotes = localNotes.map(n => ({
        id: n.id,
        user_id: uid,
        content: n.content,
        pinned: n.pinned,
        color: n.color,
        created_at: n.createdAt,
        updated_at: n.updatedAt,
      }));
      
      await supabase.from('notes').insert(dbNotes);
      console.log(`Migrated ${localNotes.length} notes to Supabase`);
    }
    
    hasMigratedRef.current = true;
  }, []);

  // Fetch notes from Supabase or localStorage
  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchNotes = async () => {
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

        if (!error && data) {
          setNotes(data.map(mapDbNoteToLocal));
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
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setNotes(prev => [mapDbNoteToLocal(payload.new as DbNote), ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setNotes(prev =>
                  prev.map(n =>
                    n.id === (payload.new as DbNote).id
                      ? mapDbNoteToLocal(payload.new as DbNote)
                      : n
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setNotes(prev => prev.filter(n => n.id !== (payload.old as DbNote).id));
              }
            }
          )
          .subscribe();
      } else {
        // Fallback to localStorage for unauthenticated users
        setNotes(loadNotes());
      }

      setLoading(false);
    };

    fetchNotes();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, migrateLocalToSupabase]);

  const addNote = useCallback(async (content: string, color: string | null = null) => {
    const supabase = supabaseRef.current;
    const now = new Date().toISOString();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newNote: Note = {
      id,
      content,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      color,
    };

    if (userId) {
      setSyncing(true);
      const { data, error } = await supabase
        .from('notes')
        .insert({
          id,
          user_id: userId,
          content,
          pinned: false,
          color,
        })
        .select()
        .single();

      if (!error && data) {
        setNotes(prev => [mapDbNoteToLocal(data), ...prev]);
      }
      setSyncing(false);
      return data ? mapDbNoteToLocal(data) : newNote;
    } else {
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      return newNote;
    }
  }, [userId, notes]);

  const updateNote = useCallback(async (noteId: string, content: string) => {
    const supabase = supabaseRef.current;
    const now = new Date().toISOString();

    if (userId) {
      setSyncing(true);
      const { error } = await supabase
        .from('notes')
        .update({
          content,
          updated_at: now,
        })
        .eq('id', noteId)
        .eq('user_id', userId);

      if (!error) {
        setNotes(prev =>
          prev.map(note =>
            note.id === noteId
              ? { ...note, content, updatedAt: now }
              : note
          )
        );
      }
      setSyncing(false);
    } else {
      const updatedNotes = notes.map(note =>
        note.id === noteId
          ? { ...note, content, updatedAt: now }
          : note
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    const supabase = supabaseRef.current;

    if (userId) {
      setSyncing(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (!error) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
      setSyncing(false);
    } else {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  const togglePinNote = useCallback(async (noteId: string) => {
    const supabase = supabaseRef.current;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newPinned = !note.pinned;

    if (userId) {
      setSyncing(true);
      const { error } = await supabase
        .from('notes')
        .update({ pinned: newPinned })
        .eq('id', noteId)
        .eq('user_id', userId);

      if (!error) {
        setNotes(prev =>
          prev.map(n =>
            n.id === noteId ? { ...n, pinned: newPinned } : n
          )
        );
      }
      setSyncing(false);
    } else {
      const updatedNotes = notes.map(n =>
        n.id === noteId ? { ...n, pinned: newPinned } : n
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  }, [userId, notes]);

  const setNoteColor = useCallback(async (noteId: string, color: string | null) => {
    const supabase = supabaseRef.current;

    if (userId) {
      setSyncing(true);
      const { error } = await supabase
        .from('notes')
        .update({ color })
        .eq('id', noteId)
        .eq('user_id', userId);

      if (!error) {
        setNotes(prev =>
          prev.map(note =>
            note.id === noteId ? { ...note, color } : note
          )
        );
      }
      setSyncing(false);
    } else {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, color } : note
      );
      setNotes(updatedNotes);
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
