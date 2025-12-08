import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types';
import { loadNotes, saveNotes } from '@/utils/storageUtils';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const addNote = useCallback((content: string, color: string | null = null) => {
    const newNote: Note = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      color,
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    return newNote;
  }, [notes]);

  const updateNote = useCallback((noteId: string, content: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, content, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes]);

  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes]);

  const togglePinNote = useCallback((noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, pinned: !note.pinned }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes]);

  const setNoteColor = useCallback((noteId: string, color: string | null) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, color }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes]);

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
  };
}
