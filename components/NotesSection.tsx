'use client';

import { useState } from 'react';
import { Note } from '@/types';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string, color: string | null) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const NOTE_COLORS = [
  { value: null, label: 'Default', class: 'bg-white/5' },
  { value: '#fef3c7', label: 'Yellow', class: 'bg-yellow-500/20' },
  { value: '#dbeafe', label: 'Blue', class: 'bg-blue-500/20' },
  { value: '#dcfce7', label: 'Green', class: 'bg-green-500/20' },
  { value: '#fce7f3', label: 'Pink', class: 'bg-pink-500/20' },
  { value: '#f3e8ff', label: 'Purple', class: 'bg-purple-500/20' },
];

export default function NotesSection({ 
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
}: NotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent.trim(), newNoteColor);
      setNewNoteContent('');
      setNewNoteColor(null);
      setIsAdding(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      onUpdateNote(editingNoteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const formatDate = (dateStr: string) => {
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

  const getColorClass = (color: string | null) => {
    const colorConfig = NOTE_COLORS.find(c => c.value === color);
    return colorConfig?.class || 'bg-white/5';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-sm sm:text-base">Notes</h3>
          <span className="text-[10px] sm:text-xs text-white/30">({notes.length})</span>
        </div>
        
        {/* Add Note Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
            title="Add Note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="glass-card p-3 sm:p-4 mb-3 fade-in">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note..."
            autoFocus
            rows={3}
            className="w-full p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          
          {/* Color Picker */}
          <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            {NOTE_COLORS.map((color) => (
              <button
                key={color.value || 'default'}
                onClick={() => setNewNoteColor(color.value)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md transition-all ${color.class} ${
                  newNoteColor === color.value
                    ? 'ring-2 ring-white/50 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.label}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="flex-1 btn-primary text-xs sm:text-sm py-1.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNoteContent('');
                setNewNoteColor(null);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm bg-white/5 text-white/60 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-white/40 text-xs sm:text-sm mb-1">No notes yet</p>
            <p className="text-white/20 text-[10px] sm:text-xs">Click the + button to create one</p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`glass-card p-3 sm:p-4 transition-all duration-300 fade-in group relative ${getColorClass(note.color)}`}
            >
              {editingNoteId === note.id ? (
                // Edit Mode
                <>
      <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs sm:text-sm resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 btn-primary text-xs py-1.5"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/60 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  {/* Pin indicator */}
                  {note.pinned && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.03 1.632.57 2.18.598.548 1.455.703 2.197.433L7.5 13.5l-.5 3.5a1 1 0 11-2 0l.5-3.5-1.45 1.939c-.742.27-1.599.115-2.197-.433-.6-.548-.82-1.4-.57-2.18L2.5 10.274V3a1 1 0 012 0v7.274z" />
                      </svg>
                    </div>
                  )}

                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {note.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                    <span className="text-[9px] sm:text-[10px] text-white/40">
                      {formatDate(note.updatedAt)}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onTogglePin(note.id)}
                        className="p-1 rounded text-white/40 hover:text-orange-400 hover:bg-white/10 transition-all"
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 rounded text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all"
                        title="Edit"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this note?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
