import { useState, useEffect } from 'react';
import { loadNotes, saveNotes } from '@/utils/storageUtils';

export function useNotes() {
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const updateNotes = (newNotes: string) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  return {
    notes,
    updateNotes,
  };
}

