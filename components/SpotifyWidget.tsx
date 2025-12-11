'use client';

import { useState, useRef, useEffect } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';

// Vinyl record animation component (for mini view)
function VinylRecord({ 
  albumArt, 
  isPlaying, 
  dominantColor 
}: { 
  albumArt: string; 
  isPlaying: boolean; 
  dominantColor: string;
}) {
  return (
    <div className="relative w-full aspect-square">
      {/* Vinyl disc */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ 
          animationDuration: '3s',
          boxShadow: `0 0 40px ${dominantColor}30, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Grooves */}
        <div className="absolute inset-2 rounded-full border border-white/5" />
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
        <div className="absolute inset-10 rounded-full border border-white/5" />
        
        {/* Center label (album art) */}
        <div className="absolute inset-[30%] rounded-full overflow-hidden border-4 border-zinc-700">
          <img 
            src={albumArt} 
            alt="Album art"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Center hole */}
        <div className="absolute inset-[48%] rounded-full bg-zinc-900 border border-zinc-700" />
      </div>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 blur-2xl -z-10"
        style={{ backgroundColor: dominantColor }}
      />
    </div>
  );
}

// Full-screen vinyl player
function FullScreenPlayer({
  track,
  albumArt,
  isPlaying,
  dominantColor,
  mood,
  isLiked,
  progress,
  duration,
  shuffle,
  repeat,
  onClose,
  onTogglePlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleLike,
  formatTime,
}: {
  track: {
    name: string;
    artists: { name: string; external_urls: { spotify: string } }[];
    album: { name: string };
    external_urls: { spotify: string };
    explicit?: boolean;
  };
  albumArt: string;
  isPlaying: boolean;
  dominantColor: string;
  mood: { mood: string; emoji: string; color: string } | null;
  isLiked: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'context' | 'track';
  onClose: () => void;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleLike: () => void;
  formatTime: (ms: number) => string;
}) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Handle progress bar click/drag
  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    onSeek(Math.floor(percent * duration));
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        onTogglePlayPause();
      }
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onTogglePlayPause, onNext, onPrevious]);

  const percentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop blur - full coverage */}
      <div 
        className={`fixed inset-0 backdrop-blur-2xl transition-all duration-300 ${
          isVisible ? 'bg-black/80' : 'bg-black/0'
        }`}
        onClick={onClose}
      />
      
      {/* Gradient overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${dominantColor}25 0%, transparent 40%, transparent 60%, ${dominantColor}20 100%)`,
        }}
      />

      {/* Animated background orbs */}
      <div 
        className={`fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] animate-pulse pointer-events-none transition-opacity duration-700 ${
          isVisible ? 'opacity-40' : 'opacity-0'
        }`}
        style={{ backgroundColor: dominantColor, animationDuration: '4s' }}
      />
      <div 
        className={`fixed bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[128px] animate-pulse pointer-events-none transition-opacity duration-700 ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        style={{ backgroundColor: dominantColor, animationDuration: '6s' }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className={`fixed top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 z-10 group ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <svg className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content */}
      <div className="relative w-full max-w-4xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 min-h-screen">
        {/* Vinyl section */}
        <div 
          className={`relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 shrink-0 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-180'
          }`}
        >
          {/* Vinyl disc */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ 
              animationDuration: '3s',
              boxShadow: `
                0 25px 50px -12px rgba(0,0,0,0.5),
                0 0 100px ${dominantColor}30,
                inset 0 0 100px rgba(0,0,0,0.5)
              `,
            }}
          >
            {/* Outer shine ring */}
            <div className="absolute inset-0 rounded-full border border-white/10" />
            
            {/* Grooves - more detailed */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full border border-white/[0.03]"
                style={{ inset: `${8 + i * 3}%` }}
              />
            ))}
            
            {/* Reflective groove highlights */}
            <div 
              className="absolute inset-[15%] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 0%, ${dominantColor}10 10%, transparent 20%, ${dominantColor}05 40%, transparent 50%, ${dominantColor}10 70%, transparent 80%, ${dominantColor}05 90%, transparent 100%)`,
              }}
            />

            {/* Center label (album art) */}
            <div 
              className="absolute inset-[28%] rounded-full overflow-hidden shadow-2xl"
              style={{
                border: `4px solid ${dominantColor}40`,
                boxShadow: `0 0 30px ${dominantColor}30`,
              }}
            >
              <img 
                src={albumArt} 
                alt="Album art"
                className="w-full h-full object-cover"
              />
              {/* Label overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>
            
            {/* Center spindle */}
            <div className="absolute inset-[47%] rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 shadow-inner" />
          </div>
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl -z-10 animate-pulse"
            style={{ 
              backgroundColor: dominantColor,
              opacity: isPlaying ? 0.3 : 0.15,
              animationDuration: '2s',
            }}
          />

          {/* Tonearm (optional decorative element) */}
          <div 
            className="absolute -right-8 top-4 w-32 h-2 origin-left hidden lg:block"
            style={{
              transform: isPlaying ? 'rotate(25deg)' : 'rotate(5deg)',
              transition: 'transform 0.5s ease-out',
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-zinc-600 to-zinc-700 rounded-full shadow-lg" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-500" />
          </div>
        </div>

        {/* Info & controls section */}
        <div 
          className={`flex-1 w-full max-w-md text-center lg:text-left transition-all duration-500 delay-150 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          {/* Now Playing label */}
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              {isPlaying && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dominantColor }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dominantColor, animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dominantColor, animationDelay: '0.4s' }} />
                </>
              )}
            </div>
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: dominantColor }}>
              {isPlaying ? 'Now Playing' : 'Paused'}
            </span>
          </div>

          {/* Track name */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {track.name}
          </h1>

          {/* Artist */}
          <p className="text-lg sm:text-xl text-white/60 mb-1">
            {track.artists.map(a => a.name).join(', ')}
          </p>

          {/* Album */}
          <p className="text-sm text-white/40 mb-4">
            {track.album.name}
          </p>

          {/* Mood & like */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
            {mood && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${mood.color}20` }}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-sm font-medium" style={{ color: mood.color }}>
                  {mood.mood}
                </span>
              </div>
            )}
            <button
              onClick={onToggleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                isLiked ? 'bg-[#1DB954]/20' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <svg 
                className={`w-5 h-5 ${isLiked ? 'text-[#1DB954]' : 'text-white/60'}`}
                fill={isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-sm ${isLiked ? 'text-[#1DB954]' : 'text-white/60'}`}>
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-2 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
            >
              {/* Buffered/progress */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: dominantColor,
                }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                style={{ 
                  left: `calc(${percentage}% - 8px)`,
                  backgroundColor: dominantColor,
                  boxShadow: `0 0 10px ${dominantColor}`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center lg:justify-start gap-4">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-3 rounded-full transition-all ${
                shuffle ? '' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
              style={shuffle ? { color: dominantColor, backgroundColor: `${dominantColor}20` } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={onTogglePlayPause}
              className="p-5 rounded-full text-white transition-all hover:scale-105 shadow-2xl"
              style={{ 
                backgroundColor: dominantColor,
                boxShadow: `0 10px 40px ${dominantColor}50`,
              }}
            >
              {isPlaying ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            {/* Repeat */}
            <button
              onClick={onCycleRepeat}
              className={`p-3 rounded-full relative transition-all ${
                repeat !== 'off' ? '' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
              style={repeat !== 'off' ? { color: dominantColor, backgroundColor: `${dominantColor}20` } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {repeat === 'track' && (
                <span 
                  className="absolute -top-1 -right-1 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                  style={{ backgroundColor: dominantColor, color: '#000' }}
                >
                  1
                </span>
              )}
            </button>
          </div>

          {/* Open in Spotify */}
          <div className="mt-8 flex justify-center lg:justify-start">
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Open in Spotify
            </a>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-white/30 transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Space</kbd>
          Play/Pause
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">→</kbd>
          Skip
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Esc</kbd>
          Close
        </span>
      </div>
    </div>
  );
}

// Audio visualizer bars
function AudioVisualizer({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const bars = 5;
  
  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            isPlaying ? 'animate-pulse' : 'h-1'
          }`}
          style={{
            backgroundColor: color,
            height: isPlaying ? `${Math.random() * 100}%` : '25%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.4 + Math.random() * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

// Progress bar component
function ProgressBar({ 
  progress, 
  duration, 
  onSeek,
  color,
  formatTime,
}: { 
  progress: number; 
  duration: number; 
  onSeek: (position: number) => void;
  color: string;
  formatTime: (ms: number) => string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const percentage = duration > 0 ? (progress / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(Math.floor(percent * duration));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setHoverPosition(percent * duration);
  };

  return (
    <div className="space-y-1">
      <div
        ref={barRef}
        className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPosition(null)}
      >
        {/* Progress */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        
        {/* Hover indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              left: `${(hoverPosition / duration) * 100}%`,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        
        {/* Current position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ 
            left: `${percentage}%`,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      {/* Time labels */}
      <div className="flex justify-between text-[10px] text-white/40">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

// Volume control
function VolumeControl({ 
  volume, 
  onVolumeChange,
  color,
}: { 
  volume: number; 
  onVolumeChange: (volume: number) => void;
  color: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(volume);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(prevVolume.current);
    } else {
      prevVolume.current = volume;
      onVolumeChange(0);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative">
      <button
        onClick={handleMuteToggle}
        onMouseEnter={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-white/10 transition-all"
      >
        {volume === 0 || isMuted ? (
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : volume < 50 ? (
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Volume slider popup */}
      {isOpen && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass-card rounded-lg"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              onVolumeChange(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Device selector
function DeviceSelector({ 
  devices, 
  onSelect,
}: { 
  devices: { id: string; name: string; type: string; is_active: boolean }[];
  onSelect: (deviceId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'computer':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'smartphone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'speaker':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-all"
      >
        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-48 glass-card p-2 z-50">
            <p className="text-xs text-white/40 px-2 py-1 mb-1">Devices</p>
            {devices.length === 0 ? (
              <p className="text-xs text-white/50 px-2 py-2">No devices found</p>
            ) : (
              devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    onSelect(device.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${
                    device.is_active 
                      ? 'bg-[#1DB954]/20 text-[#1DB954]' 
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {getDeviceIcon(device.type)}
                  <span className="text-sm truncate">{device.name}</span>
                  {device.is_active && (
                    <AudioVisualizer isPlaying={true} color="#1DB954" />
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Main Spotify Widget
export default function SpotifyWidget() {
  const { isAuthenticated } = useAuth();
  const spotify = useSpotify();
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (spotify.isLoading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!spotify.isConnected) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#1DB954]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Connect Spotify</h3>
            <p className="text-xs text-white/50">See what you&apos;re playing</p>
          </div>
        </div>
        <button
          onClick={spotify.connect}
          className="w-full py-2.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium text-sm transition-all"
        >
          Connect with Spotify
        </button>
      </div>
    );
  }

  // No current track
  if (!spotify.currentTrack) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#1DB954]/50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/70">Nothing playing</p>
            <p className="text-xs text-white/40">Play something on Spotify</p>
          </div>
          <button
            onClick={spotify.refreshPlayback}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Recently played */}
        {spotify.recentTracks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 mb-2">Recently Played</p>
            <div className="space-y-2">
              {spotify.recentTracks.slice(0, 3).map((item, i) => (
                <div key={`${item.track.id}-${i}`} className="flex items-center gap-2">
                  <img 
                    src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                    alt={item.track.album.name}
                    className="w-8 h-8 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{item.track.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{item.track.artists[0]?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const track = spotify.currentTrack;
  const albumArt = track.album.images[0]?.url || track.album.images[1]?.url;

  return (
    <>
      {/* Full-screen player */}
      {showFullScreen && (
        <FullScreenPlayer
          track={track}
          albumArt={albumArt}
          isPlaying={spotify.isPlaying}
          dominantColor={spotify.dominantColor}
          mood={spotify.mood}
          isLiked={spotify.isLiked}
          progress={spotify.progress}
          duration={spotify.duration}
          shuffle={spotify.shuffle}
          repeat={spotify.repeat}
          onClose={() => setShowFullScreen(false)}
          onTogglePlayPause={spotify.togglePlayPause}
          onNext={spotify.next}
          onPrevious={spotify.previous}
          onSeek={spotify.seek}
          onToggleShuffle={spotify.toggleShuffle}
          onCycleRepeat={spotify.cycleRepeat}
          onToggleLike={spotify.toggleLike}
          formatTime={spotify.formatTime}
        />
      )}

      <div 
        className="glass-card overflow-hidden transition-all duration-300"
        style={{
          boxShadow: spotify.isPlaying ? `0 0 40px ${spotify.dominantColor}20` : undefined,
        }}
      >
        {/* Main content */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Album art (clickable to open full-screen) */}
            <button 
              onClick={() => setShowFullScreen(true)}
              className="relative shrink-0 group active:scale-90 transition-transform duration-150"
            >
              <img
                src={albumArt}
                alt={track.album.name}
                className="w-14 h-14 rounded-lg object-cover shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl group-active:scale-95"
                style={{
                  boxShadow: spotify.isPlaying ? `0 4px 20px ${spotify.dominantColor}40` : undefined,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 group-active:bg-black/70">
                <svg className="w-6 h-6 text-white transition-transform group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              {spotify.isPlaying && (
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: spotify.dominantColor }}
                >
                  <AudioVisualizer isPlaying={true} color="#fff" />
                </div>
              )}
            </button>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a 
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white truncate hover:underline"
              >
                {track.name}
              </a>
              {track.explicit && (
                <span className="px-1 text-[8px] bg-white/20 rounded text-white/60 shrink-0">E</span>
              )}
            </div>
            <a
              href={track.artists[0]?.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 truncate block hover:underline"
            >
              {track.artists.map(a => a.name).join(', ')}
            </a>
            
            {/* Mood indicator */}
            {spotify.mood && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs">{spotify.mood.emoji}</span>
                <span 
                  className="text-[10px]"
                  style={{ color: spotify.mood.color }}
                >
                  {spotify.mood.mood}
                </span>
              </div>
            )}
          </div>

          {/* Like button */}
          <button
            onClick={spotify.toggleLike}
            className={`p-2 rounded-lg transition-all ${
              spotify.isLiked ? 'text-[#1DB954]' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <svg 
              className="w-5 h-5" 
              fill={spotify.isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <ProgressBar
            progress={spotify.progress}
            duration={spotify.duration}
            onSeek={spotify.seek}
            color={spotify.dominantColor}
            formatTime={spotify.formatTime}
          />
        </div>

        {/* Controls */}
        <div className="mt-3">
          {/* All controls in one centered row */}
          <div className="flex items-center justify-center gap-1">
            {/* Volume - left side */}
            <VolumeControl
              volume={spotify.volume}
              onVolumeChange={spotify.setVolume}
              color={spotify.dominantColor}
            />

            {/* Shuffle */}
            <button
              onClick={spotify.toggleShuffle}
              className={`p-2 rounded-lg transition-all ${
                spotify.shuffle ? 'text-[#1DB954]' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Previous */}
            <button
              onClick={spotify.previous}
              className="p-2 rounded-lg text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={spotify.togglePlayPause}
              className="p-3 rounded-full text-white transition-all hover:scale-105"
              style={{ backgroundColor: spotify.dominantColor }}
            >
              {spotify.isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={spotify.next}
              className="p-2 rounded-lg text-white/60 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            {/* Repeat */}
            <button
              onClick={spotify.cycleRepeat}
              className={`p-2 rounded-lg transition-all relative ${
                spotify.repeat !== 'off' ? 'text-[#1DB954]' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {spotify.repeat === 'track' && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-[#1DB954] text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>
              )}
            </button>

            {/* Device - right side */}
            <DeviceSelector
              devices={spotify.devices}
              onSelect={spotify.transferToDevice}
            />
          </div>
        </div>
      </div>

        {/* Disconnect option */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="text-[10px] text-white/40">
              {spotify.user?.display_name}
            </span>
          </div>
          <button
            onClick={spotify.disconnect}
            className="text-[10px] text-white/30 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
}

