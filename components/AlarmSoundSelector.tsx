'use client';

import { useState, useRef, useEffect } from 'react';
import { AlarmSound, ALARM_SOUNDS } from '@/types';

interface AlarmSoundSelectorProps {
  value: AlarmSound;
  onChange: (sound: AlarmSound) => void;
}

export default function AlarmSoundSelector({ value, onChange }: AlarmSoundSelectorProps) {
  const [isPlaying, setIsPlaying] = useState<AlarmSound | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AlarmSound>(value);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync pending selection with value prop when it changes externally
  useEffect(() => {
    setPendingSelection(value);
  }, [value]);

  const playSound = async (soundId: AlarmSound) => {
    // Stop any currently playing audio first
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
    }

    const audio = new Audio(`/notification_sounds/${soundId}.mp3`);
    audioRef.current = audio;
    
    setIsPlaying(soundId);
    
    audio.onended = () => {
      setIsPlaying(null);
    };

    audio.onerror = () => {
      setIsPlaying(null);
    };

    try {
      await audio.play();
    } catch {
      // Autoplay might be blocked or interrupted
      setIsPlaying(null);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // Ignore errors
      }
      setIsPlaying(null);
    }
  };

  const handlePreview = (soundId: AlarmSound) => {
    setPendingSelection(soundId);
    playSound(soundId);
  };

  const handleSave = () => {
    onChange(pendingSelection);
  };

  const hasChanges = pendingSelection !== value;

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-white/50 uppercase tracking-wider mb-2 block">
        Alarm Sound
      </label>
      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {ALARM_SOUNDS.map((sound) => (
          <button
            key={sound.id}
            onClick={() => handlePreview(sound.id)}
            className={`
              p-2 rounded-lg text-left transition-all flex items-center gap-2 group
              ${pendingSelection === sound.id
                ? 'bg-cyan-500/20 border border-cyan-500/30'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
              }
            `}
          >
            {/* Sound icon */}
            <span className="text-sm flex-shrink-0">{sound.icon}</span>
            
            {/* Sound name */}
            <span className={`text-[10px] font-medium truncate flex-1 ${
              pendingSelection === sound.id ? 'text-cyan-400' : 'text-white/80'
            }`}>
              {sound.name}
            </span>
            
            {/* Play/Stop indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying === sound.id) {
                  stopSound();
                } else {
                  playSound(sound.id);
                }
              }}
              className={`
                w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${isPlaying === sound.id 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-white/50 opacity-0 group-hover:opacity-100'
                }
              `}
            >
              {isPlaying === sound.id ? (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </button>
        ))}
      </div>
      
      {/* Footer with save button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">
            {hasChanges ? 'Preview:' : 'Saved:'}
          </span>
          <span className={`text-[10px] font-medium ${hasChanges ? 'text-amber-400' : 'text-cyan-400'}`}>
            {ALARM_SOUNDS.find(s => s.id === pendingSelection)?.icon} {ALARM_SOUNDS.find(s => s.id === pendingSelection)?.name}
          </span>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`
            px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5
            ${hasChanges
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save
        </button>
      </div>
    </div>
  );
}
