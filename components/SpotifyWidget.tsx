'use client';

import { useState, useRef, useEffect } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';

// Vinyl record animation component
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

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
    <div 
      className="glass-card overflow-hidden transition-all duration-300"
      style={{
        boxShadow: spotify.isPlaying ? `0 0 40px ${spotify.dominantColor}20` : undefined,
      }}
    >
      {/* Expanded view with vinyl */}
      {isExpanded && (
        <div className="p-6 pb-4">
          <div className="max-w-[200px] mx-auto mb-4">
            <VinylRecord 
              albumArt={albumArt} 
              isPlaying={spotify.isPlaying}
              dominantColor={spotify.dominantColor}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Album art (clickable to expand) */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative shrink-0 group"
          >
            <img
              src={albumArt}
              alt={track.album.name}
              className={`w-14 h-14 rounded-lg object-cover shadow-lg transition-transform ${
                isExpanded ? 'scale-0 h-0 w-0 opacity-0' : ''
              }`}
            />
            {spotify.isPlaying && !isExpanded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <AudioVisualizer isPlaying={true} color={spotify.dominantColor} />
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
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
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
          </div>

          <div className="flex items-center gap-1">
            <VolumeControl
              volume={spotify.volume}
              onVolumeChange={spotify.setVolume}
              color={spotify.dominantColor}
            />
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
  );
}

