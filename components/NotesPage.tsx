'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Note, ContentBlock } from '@/types';
import { parseContentToBlocks, createBlock, serializeBlocks } from '@/utils/noteBlocks';
import NoteEditor from './NoteEditor';
import NoteList from './NoteList';

interface NotesPageProps {
  notes: Note[];
  onAddNote: (content: string | ContentBlock[], color?: string | null, title?: string) => Promise<Note>;
  onSaveNoteNow: (noteId: string, payload: { title?: string; blocks?: ContentBlock[]; content?: string }) => Promise<void>;
  onUpdateNote: (noteId: string, content: string | ContentBlock[]) => Promise<void>;
  onUpdateNoteTitle: (noteId: string, title: string) => Promise<void>;
  onUpdateNoteBlocks: (noteId: string, blocks: ContentBlock[]) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onTogglePin: (noteId: string) => Promise<void>;
  onSetColor: (noteId: string, color: string | null) => Promise<void>;
  onBack: () => void;
  syncing: boolean;
}

const NOTE_COLORS = [
  { value: null, label: 'Default', class: 'bg-white/5' },
  { value: '#fef3c7', label: 'Yellow', class: 'bg-yellow-500/20' },
  { value: '#dbeafe', label: 'Blue', class: 'bg-blue-500/20' },
  { value: '#dcfce7', label: 'Green', class: 'bg-green-500/20' },
  { value: '#fce7f3', label: 'Pink', class: 'bg-pink-500/20' },
  { value: '#f3e8ff', label: 'Purple', class: 'bg-purple-500/20' },
];

export default function NotesPage({
  notes,
  onAddNote,
  onSaveNoteNow,
  onUpdateNote,
  onUpdateNoteTitle,
  onUpdateNoteBlocks,
  onDeleteNote,
  onTogglePin,
  onSetColor,
  onBack,
  syncing,
}: NotesPageProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected note
  const selectedNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => {
      const blocks = parseContentToBlocks(note.content);
      const text = blocks.map(b => 
        b.content.map(s => s.text).join('')
      ).join(' ').toLowerCase();
      return text.includes(query) || (note.title?.toLowerCase().includes(query));
    });
  }, [notes, searchQuery]);

  // Auto-select first note if none selected
  useMemo(() => {
    if (!selectedNoteId && filteredNotes.length > 0) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [filteredNotes, selectedNoteId]);

  const handleCreateNote = async () => {
    const newBlock = createBlock('paragraph', '');
    const newNote = await onAddNote([newBlock], null);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = async (noteId: string) => {
    await onDeleteNote(noteId);
    if (selectedNoteId === noteId) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Back Button */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-white">Notes</h1>
                {syncing && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" title="Syncing..." />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNote}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-white/10 text-white text-xs sm:text-sm font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Note</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Note List */}
        <aside className="w-full sm:w-80 lg:w-96 border-r border-white/10 bg-[#0a0a12] flex flex-col">
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-white/10">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full px-3 py-2 pl-9 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Note List */}
          <div className="flex-1 overflow-y-auto">
            <NoteList
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              onDeleteNote={handleDeleteNote}
              onTogglePin={onTogglePin}
              onSetColor={onSetColor}
              colors={NOTE_COLORS}
            />
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a12]">
          {selectedNote ? (
          <NoteEditor
              note={selectedNote}
              onUpdateNote={onUpdateNote}
              onUpdateNoteTitle={onUpdateNoteTitle}
              onUpdateNoteBlocks={onUpdateNoteBlocks}
            onSaveNoteNow={onSaveNoteNow}
              onDeleteNote={handleDeleteNote}
              onTogglePin={onTogglePin}
              onSetColor={onSetColor}
              colors={NOTE_COLORS}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm mb-2">No note selected</p>
                <p className="text-white/40 text-xs">Select a note from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
