'use client';

import { useState } from 'react';

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  isSaving?: boolean;
  charCount?: number;
  wordCount?: number;
}

export default function NotesSection({ 
  notes, 
  onNotesChange,
  isSaving = false,
  charCount = 0,
  wordCount = 0
}: NotesSectionProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Notes</h3>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Saving...
            </span>
          )}
          {!isSaving && notes.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-emerald-400/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className={`
        relative flex-1 rounded-xl overflow-hidden transition-all duration-300
        ${isFocused 
          ? 'ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10' 
          : ''
        }
      `}>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="✨ Write your thoughts, ideas, or reminders here...

Use this space to:
• Jot down quick notes
• Draft event descriptions
• Keep track of important info
• Plan your week ahead"
          className="
            w-full h-full min-h-[200px] p-4 rounded-xl
            bg-white/[0.03] border border-white/10
            text-white/90 placeholder-white/25
            resize-none focus:outline-none
            transition-all duration-300
            leading-relaxed
            focus:bg-white/[0.05] focus:border-cyan-500/30
          "
          style={{ fontFamily: "'Outfit', sans-serif" }}
        />
        
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span className="font-mono">{wordCount} words</span>
          <span className="font-mono">{charCount} chars</span>
        </div>
        
        {notes.length > 0 && (
          <button
            onClick={() => onNotesChange('')}
            className="text-xs text-white/30 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick formatting hint */}
      {isFocused && (
        <div className="mt-2 text-[10px] text-white/20 fade-in">
          💡 Tip: Your notes are saved automatically as you type
        </div>
      )}
    </div>
  );
}
