'use client';

import { useState, useEffect, useRef } from 'react';
import { Note, ContentBlock, TextSegment, BlockStyle } from '@/types';
import {
  parseContentToBlocks,
  serializeBlocks,
  createBlock,
  mergeTextSegments,
  getBlockStyleClasses,
  getSegmentFormat,
} from '@/utils/noteBlocks';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (noteId: string, content: string | ContentBlock[]) => Promise<void>;
  onUpdateNoteTitle: (noteId: string, title: string) => Promise<void>;
  onUpdateNoteBlocks: (noteId: string, blocks: ContentBlock[]) => Promise<void>;
  onSaveNoteNow: (noteId: string, payload: { title?: string; blocks?: ContentBlock[]; content?: string }) => Promise<void>;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => Promise<void>;
  onSetColor: (noteId: string, color: string | null) => Promise<void>;
  colors: Array<{ value: string | null; label: string; class: string }>;
  onClose?: () => void;
}

export default function NoteEditor({
  note,
  onUpdateNote,
  onUpdateNoteTitle,
  onUpdateNoteBlocks,
  onSaveNoteNow,
  onDeleteNote,
  onTogglePin,
  onSetColor,
  colors,
  onClose,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseContentToBlocks(note.content));
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editFormat, setEditFormat] = useState<ContentBlock['content'][0]['format']>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const renderFormattedContent = (segments: TextSegment[]) =>
    segments.map((seg, i) => {
      const { text, format } = seg;
      if (!text) return null;
      const cls = [
        format?.bold && 'font-bold',
        format?.italic && 'italic',
        format?.code && 'font-mono text-xs bg-white/10 px-1 rounded',
      ]
        .filter(Boolean)
        .join(' ');
      const content = format?.link ? (
        <a href={format.link} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">
          {text}
        </a>
      ) : (
        text
      );
      return (
        <span key={i} className={cls || undefined}>
          {content}
        </span>
      );
    });

  // Sync with note changes
  useEffect(() => {
    setTitle(note.title || '');
    setBlocks(parseContentToBlocks(note.content));
  }, [note.id, note.title, note.content]);

  // Auto-save title
  useEffect(() => {
    if (title !== (note.title || '')) {
      const timer = setTimeout(() => {
        onUpdateNoteTitle(note.id, title);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [title, note.id, note.title, onUpdateNoteTitle]);

  // Auto-save blocks
  useEffect(() => {
    const currentContent = serializeBlocks(blocks);
    const noteContent = serializeBlocks(parseContentToBlocks(note.content));
    
    if (currentContent !== noteContent) {
      const timer = setTimeout(() => {
        onUpdateNoteBlocks(note.id, blocks);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [blocks, note.id, note.content, onUpdateNoteBlocks]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const getBlocksForSave = (): ContentBlock[] => {
    if (!editingBlockId) return blocks;
    return blocks.map(block =>
      block.id === editingBlockId
        ? { ...block, content: [{ text: editText, format: editFormat ?? {} }] }
        : block
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const blocksToSave = getBlocksForSave();
    const titleToSave = title;

    try {
      // Persist immediately (don't wait for debounce)
      await onSaveNoteNow(note.id, { title: titleToSave, blocks: blocksToSave });

      // Keep UI state consistent with what we saved
      if (editingBlockId) {
        setBlocks(blocksToSave);
        setEditingBlockId(null);
        setEditText('');
      }
    } catch {
      setSaveError('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (block: ContentBlock) => {
    setEditingBlockId(block.id);
    setEditText(mergeTextSegments(block.content));
    setEditFormat(getSegmentFormat(block.content));
  };

  const handleSaveBlock = (blockId: string) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, content: [{ text: editText, format: editFormat ?? {} }] } : block
      )
    );
    setEditingBlockId(null);
    setEditText('');
    setEditFormat({});
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
    setEditText('');
    setEditFormat({});
  };

  const handleUpdateBlockStyle = (blockId: string, styleUpdate: Partial<BlockStyle>) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, style: { ...block.style, ...styleUpdate } } : block
      )
    );
  };

  const toggleEditFormat = (key: 'bold' | 'italic') => {
    setEditFormat((f) => ({ ...f, [key]: !f?.[key] }));
  };

  const handleAddBlock = (afterBlockId?: string) => {
    const newBlock = createBlock('paragraph', '');
    if (afterBlockId) {
      const index = blocks.findIndex(b => b.id === afterBlockId);
      setBlocks(prev => [
        ...prev.slice(0, index + 1),
        newBlock,
        ...prev.slice(index + 1),
      ]);
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }
    setEditingBlockId(newBlock.id);
    setEditText('');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      setBlocks([createBlock('paragraph', '')]);
      return;
    }
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const handleChangeBlockType = (blockId: string, newType: ContentBlock['type']) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId
        ? { ...block, type: newType }
        : block
    ));
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const text = mergeTextSegments(block.content);
    const isEditing = editingBlockId === block.id;
    const styleClasses = getBlockStyleClasses(block.style);

    if (isEditing) {
      return (
        <div key={block.id} className={styleClasses}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={() => handleSaveBlock(block.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveBlock(block.id);
                handleAddBlock(block.id);
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            autoFocus
            className={`w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${editFormat?.bold ? 'font-bold' : ''} ${editFormat?.italic ? 'italic' : ''}`}
            rows={block.type === 'code' ? 4 : 2}
          />
        </div>
      );
    }

    const baseClasses = 'text-white/90 text-sm break-words p-2 rounded hover:bg-white/5 cursor-text';
    const formatted = block.content.length ? renderFormattedContent(block.content) : null;

    let content: JSX.Element;
    switch (block.type) {
      case 'heading1':
        content = (
          <h1 className={`${baseClasses} text-2xl font-bold`} onClick={() => handleStartEdit(block)}>
            {formatted || 'Heading 1'}
          </h1>
        );
        break;
      case 'heading2':
        content = (
          <h2 className={`${baseClasses} text-xl font-semibold`} onClick={() => handleStartEdit(block)}>
            {formatted || 'Heading 2'}
          </h2>
        );
        break;
      case 'heading3':
        content = (
          <h3 className={`${baseClasses} text-lg font-medium`} onClick={() => handleStartEdit(block)}>
            {formatted || 'Heading 3'}
          </h3>
        );
        break;
      case 'bulletList':
        content = (
          <div className={`${baseClasses} flex items-start gap-2`} onClick={() => handleStartEdit(block)}>
            <span className="text-white/60 mt-1">•</span>
            <span className="flex-1">{formatted || 'List item'}</span>
          </div>
        );
        break;
      case 'numberedList':
        content = (
          <div className={`${baseClasses} flex items-start gap-2`} onClick={() => handleStartEdit(block)}>
            <span className="text-white/60 mt-1 min-w-[1.5rem]">{index + 1}.</span>
            <span className="flex-1">{formatted || 'List item'}</span>
          </div>
        );
        break;
      case 'checkbox':
        content = (
          <div className={`${baseClasses} flex items-start gap-2`} onClick={() => handleStartEdit(block)}>
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => {
                setBlocks(prev =>
                  prev.map((b) => (b.id === block.id ? { ...b, checked: e.target.checked } : b))
                );
              }}
              className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className={`flex-1 ${block.checked ? 'line-through text-white/60' : ''}`}>
              {formatted || 'Checkbox item'}
            </span>
          </div>
        );
        break;
      case 'code':
        content = (
          <code
            className={`${baseClasses} block bg-white/10 font-mono text-xs`}
            onClick={() => handleStartEdit(block)}
          >
            {formatted || 'Code block'}
          </code>
        );
        break;
      default:
        content = (
          <p className={baseClasses} onClick={() => handleStartEdit(block)}>
            {formatted || 'Start typing...'}
          </p>
        );
    }

    return (
      <div key={block.id} className={styleClasses}>
        {content}
      </div>
    );
  };

  const getColorClass = (color: string | null) => {
    const colorConfig = colors.find(c => c.value === color);
    return colorConfig?.class || 'bg-white/5';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile Back Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="sm:hidden p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all mr-2"
                title="Back to list"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            
            {/* Color Picker */}
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color.value || 'default'}
                  onClick={() => onSetColor(note.id, color.value)}
                  className={`w-6 h-6 rounded transition-all ${color.class} ${
                    note.color === color.value
                      ? 'ring-2 ring-white/50 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
            {/* Block format: only when a block is being edited */}
            {editingBlockId && (() => {
              const block = blocks.find((b) => b.id === editingBlockId);
              if (!block) return null;
              const btn = 'p-1.5 rounded text-white/60 hover:text-cyan-300 hover:bg-white/10 transition-all text-sm';
              const btnActive = 'bg-cyan-500/20 text-cyan-300';
              return (
                <div
                  className="flex items-center gap-0.5 border-l border-white/10 pl-2 ml-1"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <button
                    type="button"
                    onClick={() => toggleEditFormat('bold')}
                    className={`${btn} font-bold ${editFormat?.bold ? btnActive : ''}`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEditFormat('italic')}
                    className={`${btn} italic ${editFormat?.italic ? btnActive : ''}`}
                    title="Italic"
                  >
                    I
                  </button>
                  <span className="w-px h-4 bg-white/10 mx-0.5" aria-hidden />
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdateBlockStyle(block.id, { align })}
                      className={`${btn} ${block.style?.align === align ? btnActive : ''}`}
                      title={`Align ${align}`}
                    >
                      {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                    </button>
                  ))}
                  <span className="w-px h-4 bg-white/10 mx-0.5" aria-hidden />
                  {(['tight', 'normal', 'relaxed'] as const).map((spacing) => (
                    <button
                      key={spacing}
                      type="button"
                      onClick={() => handleUpdateBlockStyle(block.id, { spacing })}
                      className={`${btn} text-xs ${block.style?.spacing === spacing ? btnActive : ''}`}
                      title={`Line spacing: ${spacing}`}
                    >
                      {spacing === 'tight' ? 'T' : spacing === 'normal' ? 'N' : 'R'}
                    </button>
                  ))}
                  {(['none', 'small', 'medium', 'large'] as const).map((margin) => (
                    <button
                      key={margin}
                      type="button"
                      onClick={() => handleUpdateBlockStyle(block.id, { margin })}
                      className={`${btn} text-xs ${block.style?.margin === margin ? btnActive : ''}`}
                      title={`Margin: ${margin}`}
                    >
                      M{margin === 'none' ? '0' : margin === 'small' ? '1' : margin === 'medium' ? '2' : '3'}
                    </button>
                  ))}
                  <span className="w-px h-4 bg-white/10 mx-0.5" aria-hidden />
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className={`${btn} hover:text-red-400`}
                    title="Delete block"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                isSaving
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25'
              }`}
              title="Save"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-2 rounded-lg transition-all ${
                note.pinned 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-4 h-4" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this note?')) {
                  onDeleteNote(note.id);
                }
              }}
              className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
              title="Delete note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        {saveError && (
          <div className="mt-2 text-xs text-red-300">
            {saveError}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className={`flex-1 overflow-y-auto ${getColorClass(note.color)}`}>
        <div className="max-w-3xl mx-auto p-6 sm:p-8">
          {/* Title */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-white/30 mb-6"
          />

          {/* Blocks */}
          <div className="space-y-1">
            {blocks.map((block, index) => renderBlock(block, index))}
            {blocks.length === 0 && (
              <p 
                className="text-white/40 text-sm cursor-text p-2 rounded hover:bg-white/5"
                onClick={() => handleAddBlock()}
              >
                Start typing...
              </p>
            )}
          </div>

          {/* Add Block Button */}
          <button
            onClick={() => handleAddBlock()}
            className="mt-4 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add block
          </button>
        </div>
      </div>
    </div>
  );
}
