interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-white font-semibold text-lg mb-3">Notes</h3>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add your notes here..."
        className="
          w-full flex-1 p-3 rounded-lg
          bg-white/5 border border-white/10
          text-white placeholder-white/40
          resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
          transition-all duration-300
        "
        style={{ minHeight: '200px' }}
      />
    </div>
  );
}

