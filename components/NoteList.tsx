'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { parseContentToBlocks, mergeTextSegments } from '@/utils/noteBlocks';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => Promise<void>;
  onSetColor: (noteId: string, color: string | null) => Promise<void>;
  colors: Array<{ value: string | null; label: string; class: string }>;
}

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  onSetColor,
  colors,
}: NoteListProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!isMounted) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
    }
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
  };

  const getPreview = (note: Note): string => {
    const blocks = parseContentToBlocks(note.content);
    if (blocks.length === 0) return 'Empty note';
    
    const firstBlock = blocks[0];
    const text = mergeTextSegments(firstBlock.content);
    return text.slice(0, 100) + (text.length > 100 ? '...' : '');
  };

  const getColorClass = (color: string | null) => {
    const colorConfig = colors.find(c => c.value === color);
    return colorConfig?.class || 'bg-white/5';
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p className="text-white/40 text-sm mb-1">No notes yet</p>
        <p className="text-white/20 text-xs">Create your first note</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {notes.map((note) => {
        const isSelected = note.id === selectedNoteId;
        const preview = getPreview(note);
        
        return (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`
              group relative p-3 rounded-lg cursor-pointer transition-all
              ${isSelected 
                ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-white/10' 
                : 'hover:bg-white/5'
              }
              ${getColorClass(note.color)}
            `}
          >
            {/* Pin indicator */}
            {note.pinned && (
              <div className="absolute top-2 right-2">
                <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.03 1.632.57 2.18.598.548 1.455.703 2.197.433L7.5 13.5l-.5 3.5a1 1 0 11-2 0l.5-3.5-1.45 1.939c-.742.27-1.599.115-2.197-.433-.6-.548-.82-1.4-.57-2.18L2.5 10.274V3a1 1 0 012 0v7.274z" />
                </svg>
              </div>
            )}

            {/* Title or Preview */}
            {note.title ? (
              <h3 className="text-white font-medium text-sm mb-1 pr-6">{note.title}</h3>
            ) : (
              <h3 className="text-white/60 font-medium text-sm mb-1 pr-6 italic">Untitled</h3>
            )}
            
            {/* Preview */}
            <p className="text-white/60 text-xs line-clamp-2 mb-2">{preview}</p>
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40">{formatDate(note.updatedAt)}</span>
              
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(note.id);
                  }}
                  className="p-1 rounded text-white/40 hover:text-orange-400 hover:bg-white/10 transition-all"
                  title={note.pinned ? 'Unpin' : 'Pin'}
                >
                  <svg className="w-3 h-3" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this note?')) {
                      onDeleteNote(note.id);
                    }
                  }}
                  className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
