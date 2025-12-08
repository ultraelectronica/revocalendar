import { useState, useEffect, useCallback } from 'react';
import { loadSingleNote, saveSingleNote } from '@/utils/storageUtils';

export function useNotes() {
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setNotes(loadSingleNote());
  }, []);

  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes);
    setIsSaving(true);
    
    // Debounced save
    const timeoutId = setTimeout(() => {
      saveSingleNote(newNotes);
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const clearNotes = useCallback(() => {
    setNotes('');
    saveSingleNote('');
    setLastSaved(new Date());
  }, []);

  // Character and word count
  const charCount = notes.length;
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const lineCount = notes.split('\n').length;

  return {
    notes,
    updateNotes,
    clearNotes,
    isSaving,
    lastSaved,
    charCount,
    wordCount,
    lineCount,
  };
}
