'use client';

import { useState, useEffect, useMemo } from 'react';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import EventListModal from '@/components/EventListModal';
import FloatingLines from '@/components/FloatingLines';
import UpcomingPlans from '@/components/UpcomingPlans';
import NotesSection from '@/components/NotesSection';
import SearchBar from '@/components/SearchBar';
import QuickStats from '@/components/QuickStats';
import FocusTimer from '@/components/FocusTimer';
import SpotifyWidget from '@/components/SpotifyWidget';
import AuthModal from '@/components/AuthModal';
import EncryptionModal from '@/components/EncryptionModal';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from '@/hooks/useEncryption';
import { useEvents } from '@/hooks/useEvents';
import { useNotes } from '@/hooks/useNotes';
import { CalendarEvent } from '@/types';
import { MONTHS } from '@/utils/dateUtils';

// Saturn Logo Component
function SaturnLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Planet body */}
      <circle cx="12" cy="12" r="6" fill="url(#planetGradient)" />
      {/* Ring - behind */}
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradient)" strokeWidth="1.5" fill="none" 
        strokeDasharray="0 15.7 31.4" transform="rotate(-20 12 12)" />
      {/* Ring - front */}
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradient)" strokeWidth="1.5" fill="none"
        strokeDasharray="31.4 15.7 0" transform="rotate(-20 12 12)" />
      <defs>
        <linearGradient id="planetGradient" x1="6" y1="6" x2="18" y2="18">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradient" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// User Menu Component
function UserMenu() {
  const { user, profile, isAuthenticated, loading, signingOut, signOut } = useAuth();
  const { isSetup, isUnlocked, lockEncryption } = useEncryption();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline">Sign In</span>
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <span className="hidden sm:block text-sm text-white/70 max-w-[100px] truncate">
          {displayName}
        </span>
        <svg className={`w-4 h-4 text-white/40 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-white/10 mb-2">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>

            {/* Encryption Status */}
            {isSetup && (
              <div className="px-3 py-2 flex items-center gap-2 text-xs">
                {isUnlocked ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400">Encrypted & Unlocked</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-amber-400">Encrypted (Locked)</span>
                  </>
                )}
              </div>
            )}

            {/* Sync Status */}
            <div className="px-3 py-2 flex items-center gap-2 text-xs text-white/50">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Synced to cloud
            </div>

            {/* Lock Encryption Button */}
            {isSetup && isUnlocked && (
              <button
                onClick={() => {
                  lockEncryption();
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Lock Encryption
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setShowSignOutConfirm(true);
                setIsMenuOpen(false);
              }}
              disabled={signingOut}
              className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Sign Out Confirmation Dialog */}
      {showSignOutConfirm && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowSignOutConfirm(false);
              setSignOutError(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Sign Out</h3>
                  <p className="text-sm text-white/50">Are you sure you want to sign out?</p>
                </div>
              </div>

              {signOutError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {signOutError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setSignOutError(null);
                    
                    try {
                      // Lock encryption if unlocked
                      if (isSetup && isUnlocked) {
                        lockEncryption();
                      }

                      // Sign out
                      const { error } = await signOut();
                      
                      if (error) {
                        setSignOutError(error.message || 'Failed to sign out. Please try again.');
                      } else {
                        setShowSignOutConfirm(false);
                        // Optionally refresh the page to ensure clean state
                        window.location.reload();
                      }
                    } catch (err) {
                      setSignOutError('An unexpected error occurred. Please try again.');
                      console.error('Sign out error:', err);
                    }
                  }}
                  disabled={signingOut}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing out...
                    </span>
                  ) : (
                    'Sign Out'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSignOutConfirm(false);
                    setSignOutError(null);
                  }}
                  disabled={signingOut}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [nav, setNav] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'plans' | 'notes'>('plans');
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);

  // Auth hook
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  // Encryption hook
  const encryption = useEncryption();
  const { 
    isSetup: encryptionSetup, 
    isUnlocked: encryptionUnlocked, 
    isLoading: encryptionLoading,
    encrypt,
    decrypt,
    encryptFields,
    decryptFields,
  } = encryption;

  // Create encryption helpers object to pass to hooks
  const encryptionHelpers = useMemo(() => {
    if (!isAuthenticated) return null;
    return {
      encrypt,
      decrypt,
      encryptFields,
      decryptFields,
      isUnlocked: encryptionUnlocked,
    };
  }, [isAuthenticated, encrypt, decrypt, encryptFields, decryptFields, encryptionUnlocked]);

  // Pass userId and encryption to hooks for Supabase sync
  const { 
    events, 
    groupedUpcomingEvents,
    stats,
    searchQuery,
    setSearchQuery,
    addEvent, 
    updateEvent, 
    deleteEvent,
    toggleEventCompletion,
    getEventsForDate,
    loading: eventsLoading,
    syncing: eventsSyncing,
  } = useEvents({ userId, encryption: encryptionHelpers });
  
  const { 
    notes, 
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    loading: notesLoading,
    syncing: notesSyncing,
  } = useNotes({ userId, encryption: encryptionHelpers });

  const isSyncing = eventsSyncing || notesSyncing;
  const isLoading = authLoading || eventsLoading || notesLoading || encryptionLoading;

  // Show encryption modal when authenticated but encryption needs setup or unlock
  useEffect(() => {
    if (isAuthenticated && !encryptionLoading) {
      // If encryption is set up but not unlocked, show unlock modal
      if (encryptionSetup && !encryptionUnlocked) {
        setShowEncryptionModal(true);
      }
    }
  }, [isAuthenticated, encryptionSetup, encryptionUnlocked, encryptionLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEventListOpen(false);
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDate(null);
      }
      // Quick add event: Ctrl/Cmd + N
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        const today = new Date();
        setSelectedDate(`${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
        setEditingEvent(null);
        setIsEventModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsEventListOpen(true);
  };

  const handleAddEvent = () => {
    setIsEventListOpen(false);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleQuickAddEvent = () => {
    const today = new Date();
    setSelectedDate(`${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setIsEventListOpen(false);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (editingEvent) {
      updateEvent(event.id, event);
    } else {
      addEvent(event);
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    if (isEventListOpen && selectedDate) {
      const remainingEvents = getEventsForDate(selectedDate).filter(e => e.id !== eventId);
      if (remainingEvents.length === 0) {
        setIsEventListOpen(false);
        setSelectedDate(null);
      }
    }
  };

  const handleCloseModals = () => {
    setIsEventListOpen(false);
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const getCurrentDate = () => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + nav);
    return { month: dt.getMonth(), year: dt.getFullYear() };
  };

  const { month: currentMonth, year: currentYear } = getCurrentDate();

  // Memoize background props to prevent re-renders
  const backgroundProps = useMemo(() => ({
    linesGradient: ['#06b6d4', '#8b5cf6', '#f97316', '#10b981'] as string[],
    enabledWaves: ['top', 'middle', 'bottom'] as Array<'top' | 'middle' | 'bottom'>,
    lineCount: [5, 7, 5] as number[],
    animationSpeed: 0.8,
    interactive: true,
    parallax: true,
    mixBlendMode: 'screen' as const,
  }), []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden aurora-bg">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <FloatingLines {...backgroundProps} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo & Title */}
            <div className="flex flex-col flex-shrink-0">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 flex-shrink-0 -mb-2">
                  <SaturnLogo className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h1 className="text-base sm:text-lg font-bold gradient-text">Revo</h1>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-wider pl-[41px] sm:pl-[52px] -mt-0.5">Plan • Track • Achieve</p>
            </div>

            {/* Search Bar - Hidden on small screens */}
            <div className="flex-1 max-w-md hidden sm:block">
              <SearchBar 
                events={events}
                onEventClick={handleEditEvent}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Encryption Status Indicator */}
              {isAuthenticated && encryptionSetup && (
                <button
                  onClick={() => !encryptionUnlocked && setShowEncryptionModal(true)}
                  className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                    encryptionUnlocked
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-pointer hover:bg-amber-500/20'
                  }`}
                  title={encryptionUnlocked ? 'Data encrypted & unlocked' : 'Click to unlock encryption'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {encryptionUnlocked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    )}
                  </svg>
                  <span className="text-[10px] font-medium">
                    {encryptionUnlocked ? 'Encrypted' : 'Locked'}
                  </span>
                </button>
              )}

              {/* Sync Indicator */}
              {isSyncing && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <svg className="w-3.5 h-3.5 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-[10px] text-cyan-400 hidden sm:inline">Syncing</span>
                </div>
              )}

              {/* Mobile Stats Toggle */}
              <button
                onClick={() => setShowMobileStats(!showMobileStats)}
                className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                title="Toggle Stats"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              
              <button
                onClick={handleQuickAddEvent}
                className="btn-primary flex items-center gap-2"
                title="Quick add event (⌘N)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Event</span>
              </button>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="sm:hidden mt-3">
            <SearchBar 
              events={events}
              onEventClick={handleEditEvent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </header>

        {/* Mobile Stats Dropdown */}
        {showMobileStats && (
          <div className="lg:hidden px-4 py-3 border-b border-white/5 slide-in-up">
            <QuickStats stats={stats} />
          </div>
        )}

        {/* Mobile Focus Timer & Spotify */}
        <div className="lg:hidden px-4 space-y-4">
          <FocusTimer />
          <SpotifyWidget />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-[#0a0a12]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              <p className="text-white/50 text-sm">Loading your calendar...</p>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pt-8 sm:pt-10 lg:pt-12">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-5">
            {/* Left Sidebar - Stats, Timer & Spotify (Desktop only) */}
            <aside className="w-72 flex-shrink-0 hidden lg:block space-y-4">
              <QuickStats stats={stats} />
              <FocusTimer />
              <SpotifyWidget />
            </aside>

            {/* Main Calendar */}
            <section className="flex-1 min-w-0">
              <div className="glass-card p-3 sm:p-4 lg:p-5">
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white text-glow-cyan">
                      {MONTHS[currentMonth]}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/40">{currentYear}</p>
                  </div>
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <button
                      onClick={() => setNav(0)}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                        nav === 0 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Today
                    </button>
                    <div className="flex">
                      <button
                        onClick={() => setNav(prev => prev - 1)}
                        className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-l-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setNav(prev => prev + 1)}
                        className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 border-l-0 rounded-r-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
          <Calendar
            nav={nav}
            events={events}
            onDayClick={handleDayClick}
          />
        </div>
            </section>

            {/* Right Sidebar - Plans & Notes */}
            <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 sm:gap-4 lg:gap-5">
              {/* Tab Switcher */}
              <div className="glass-card p-1 flex">
                <button
                  onClick={() => setSidebarTab('plans')}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                    sidebarTab === 'plans'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-white/10'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Plans
                  </span>
                </button>
                <button
                  onClick={() => setSidebarTab('notes')}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                    sidebarTab === 'notes'
                      ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-white/10'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notes
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="glass-card p-3 sm:p-4 flex-1 min-h-[300px] lg:min-h-0 overflow-hidden">
                {sidebarTab === 'plans' ? (
                  <div className="h-full max-h-[400px] lg:max-h-none overflow-y-auto pr-1">
              <UpcomingPlans
                      groupedEvents={groupedUpcomingEvents}
                onEventClick={handleEditEvent}
                      onToggleComplete={toggleEventCompletion}
              />
            </div>
                ) : (
            <NotesSection
              notes={notes}
                    onAddNote={addNote}
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                    onTogglePin={togglePinNote}
                  />
                )}
              </div>

              {/* Keyboard Shortcuts Hint - Desktop only */}
              <div className="hidden sm:block text-center text-[10px] text-white/20 space-x-4">
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘K</kbd> Search</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘N</kbd> New Event</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> Close</span>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Modals */}
      <EventListModal
        isOpen={isEventListOpen}
        onClose={handleCloseModals}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onToggleComplete={toggleEventCompletion}
        selectedDate={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />

      {/* Encryption Modal */}
      <EncryptionModal
        isOpen={showEncryptionModal}
        onClose={() => setShowEncryptionModal(false)}
        onSuccess={() => setShowEncryptionModal(false)}
      />
    </div>
  );
}
