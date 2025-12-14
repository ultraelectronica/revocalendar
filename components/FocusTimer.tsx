'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlarmSound } from '@/types';
import AlarmSoundSelector from './AlarmSoundSelector';

interface TimerPreset {
  id: string;
  name: string;
  icon: string;
  workTime: number; // in minutes
  breakTime: number; // in minutes
  description: string;
}

const TIMER_PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    icon: '🍅',
    workTime: 25,
    breakTime: 5,
    description: '25 min focus, 5 min break',
  },
  {
    id: '52-17',
    name: '52/17',
    icon: '⚡',
    workTime: 52,
    breakTime: 17,
    description: 'Peak productivity cycle',
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    icon: '🧠',
    workTime: 90,
    breakTime: 20,
    description: '90 min deep focus session',
  },
  {
    id: 'short-burst',
    name: 'Short Burst',
    icon: '🚀',
    workTime: 15,
    breakTime: 3,
    description: 'Quick 15 min sprints',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '⚙️',
    workTime: 25,
    breakTime: 5,
    description: 'Set your own times',
  },
];

type TimerPhase = 'idle' | 'work' | 'break';

interface FocusTimerProps {
  alarmSound?: AlarmSound;
  onAlarmSoundChange?: (sound: AlarmSound) => void;
}

export default function FocusTimer({ alarmSound = 'notification', onAlarmSoundChange }: FocusTimerProps) {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(TIMER_PRESETS[0]);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(selectedPreset.workTime * 60);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current work/break time based on preset
  const getWorkTime = useCallback(() => {
    return selectedPreset.id === 'custom' ? customWorkTime : selectedPreset.workTime;
  }, [selectedPreset, customWorkTime]);

  const getBreakTime = useCallback(() => {
    return selectedPreset.id === 'custom' ? customBreakTime : selectedPreset.breakTime;
  }, [selectedPreset, customBreakTime]);

  // Play alarm sound
  const playAlarm = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, ignore error
      });
    }
    
    // Browser notification (wrapped in try-catch for mobile browser compatibility)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(phase === 'work' ? '🎉 Focus session complete!' : '💪 Break over!', {
          body: phase === 'work' ? 'Time for a break!' : 'Ready to focus again?',
          icon: '/favicon.svg',
        });
      } catch {
        // Notification creation can fail on mobile browsers (especially iOS Safari)
        // This is expected behavior - just silently ignore
      }
    }
  }, [soundEnabled, phase]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase !== 'idle') {
      playAlarm();
      
      if (phase === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        setPhase('break');
        setTimeLeft(getBreakTime() * 60);
      } else {
        setPhase('work');
        setTimeLeft(getWorkTime() * 60);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, phase, playAlarm, getWorkTime, getBreakTime]);

  // Reset timer when preset changes
  useEffect(() => {
    setTimeLeft(getWorkTime() * 60);
    setPhase('idle');
    setIsRunning(false);
  }, [selectedPreset, customWorkTime, getWorkTime]);

  const startTimer = () => {
    if (phase === 'idle') {
      setPhase('work');
      setTimeLeft(getWorkTime() * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('idle');
    setTimeLeft(getWorkTime() * 60);
  };

  const skipPhase = () => {
    if (phase === 'work') {
      setPhase('break');
      setTimeLeft(getBreakTime() * 60);
    } else if (phase === 'break') {
      setPhase('work');
      setTimeLeft(getWorkTime() * 60);
    }
    setIsRunning(false);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalTime = phase === 'work' ? getWorkTime() * 60 : phase === 'break' ? getBreakTime() * 60 : getWorkTime() * 60;
  const progress = phase === 'idle' ? 0 : ((totalTime - timeLeft) / totalTime) * 100;

  // Get phase colors
  const getPhaseColor = () => {
    switch (phase) {
      case 'work': return { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', ring: 'ring-cyan-500/30' };
      case 'break': return { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', ring: 'ring-emerald-500/30' };
      default: return { bg: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400', ring: 'ring-violet-500/30' };
    }
  };

  const colors = getPhaseColor();

  return (
    <div className="glass-card p-4 mt-4">
      {/* Hidden audio element for alarm */}
      <audio ref={audioRef} preload="auto" key={alarmSound}>
        <source src={`/notification_sounds/${alarmSound}.mp3`} type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
            <span className="text-lg">{selectedPreset.icon}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Focus Timer</h3>
            <p className="text-[10px] text-white/40">{selectedPreset.name}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl space-y-3 fade-in">
          {/* Technique Selection */}
          <div>
            <label className="text-[10px] text-white/50 uppercase tracking-wider mb-2 block">Technique</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-2 rounded-lg text-left transition-all ${
                    selectedPreset.id === preset.id
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{preset.icon}</span>
                    <span className="text-[10px] text-white/80 font-medium">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time Settings */}
          {selectedPreset.id === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/50 block mb-1">Work (min)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customWorkTime}
                  onChange={(e) => setCustomWorkTime(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/50 block mb-1">Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreakTime}
                  onChange={(e) => setCustomBreakTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50">Sound Alert</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-5 rounded-full transition-all ${
                soundEnabled ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Alarm Sound Selector */}
          {soundEnabled && onAlarmSoundChange && (
            <AlarmSoundSelector
              value={alarmSound}
              onChange={onAlarmSoundChange}
            />
          )}
        </div>
      )}

      {/* Timer Display */}
      <div className="relative mb-4">
        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={phase === 'work' ? '#06b6d4' : phase === 'break' ? '#10b981' : '#8b5cf6'} />
                <stop offset="100%" stopColor={phase === 'work' ? '#8b5cf6' : phase === 'break' ? '#06b6d4' : '#f97316'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold font-mono ${colors.text}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
              {phase === 'idle' ? 'Ready' : phase === 'work' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5"
          >
            {phase === 'idle' ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex-1 py-2 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all"
          >
            Pause
          </button>
        )}
        
        {phase !== 'idle' && (
          <>
            <button
              onClick={skipPhase}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
              title="Skip to next phase"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
              title="Reset timer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Sessions Counter */}
      <div className="text-center">
        <span className="text-[10px] text-white/30">
          Sessions completed: <span className="text-cyan-400 font-semibold">{sessionsCompleted}</span>
        </span>
      </div>

      {/* Technique Info */}
      {!showSettings && (
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30">{selectedPreset.description}</p>
        </div>
      )}
    </div>
  );
}

