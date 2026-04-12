'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import EventListModal from '@/components/EventListModal';
import Orb from '@/components/Orb';
import UpcomingPlans from '@/components/UpcomingPlans';
import SearchBar from '@/components/SearchBar';
import QuickStats from '@/components/QuickStats';
import FocusTimer from '@/components/FocusTimer';
import SpotifyWidget from '@/components/SpotifyWidget';
import WeatherWidget from '@/components/WeatherWidget';
import AuthModal from '@/components/AuthModal';
import EncryptionModal from '@/components/EncryptionModal';
import TimezoneSelector from '@/components/TimezoneSelector';
import LandingPage from '@/components/LandingPage';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from '@/hooks/useEncryption';
import { useEvents } from '@/hooks/useEvents';
import { useNotes } from '@/hooks/useNotes';
import { useSettings } from '@/hooks/useSettings';
import { CalendarEvent, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/types';
import { MONTHS, formatDateDisplay, formatTime, parseDateString } from '@/utils/dateUtils';

// Removed SaturnLogo component

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
                        setSignOutError(null);
                        setShowSignOutConfirm(false);
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
  const router = useRouter();
  const [nav, setNav] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'day' | 'tools' | 'stats'>('day');
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
  
  const { syncing: notesSyncing } = useNotes({ userId, encryption: encryptionHelpers });

  // Settings hook for timezone
  const { settings, updateSettings } = useSettings({ userId });

  const isSyncing = eventsSyncing || notesSyncing;
  // Calendar does not render notes; waiting on notes fetch blocked the whole page on refresh.
  const isLoading = authLoading || eventsLoading || encryptionLoading;

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

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setMobilePanel('day');
      return;
    }
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
    setMobilePanel('day');
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setMobilePanel('day');
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { month: currentMonth, year: currentYear } = useMemo(
    () => getCurrentDate(),
    [nav, isMounted] // Include isMounted to recalculate after hydration
  );

  const todayDateString = useMemo(() => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  }, [isMounted]);

  const mobileSelectedDate = selectedDate ?? todayDateString;

  const mobileSelectedEvents = useMemo(() => {
    if (!mobileSelectedDate) return [];

    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...getEventsForDate(mobileSelectedDate)].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [mobileSelectedDate, getEventsForDate]);

  const mobileSelectedDateLabel = useMemo(() => {
    if (!mobileSelectedDate) return '';
    return formatDateDisplay(parseDateString(mobileSelectedDate));
  }, [mobileSelectedDate]);

  const mobileGreeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return {
        title: 'Good morning',
        subtitle: 'Start with the plan that matters most today.',
      };
    }

    if (hour < 18) {
      return {
        title: 'Good afternoon',
        subtitle: 'Keep the day moving with a clear next step.',
      };
    }

    return {
      title: 'Good evening',
      subtitle: 'Wrap up the day and set up tomorrow.',
    };
  }, [isMounted]);

  const currentMonthEventCount = useMemo(() => {
    return events.filter((event) => {
      const eventDate = parseDateString(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length;
  }, [events, currentMonth, currentYear]);

  const completedMobileEvents = mobileSelectedEvents.filter((event) => event.completed).length;
  const activeMobileEvents = mobileSelectedEvents.length - completedMobileEvents;

  const handleOpenSelectedDay = () => {
    setSelectedDate(mobileSelectedDate);
    setIsEventListOpen(true);
  };

  const handleMobileAddEvent = () => {
    setSelectedDate(mobileSelectedDate);
    setMobilePanel('day');
    setEditingEvent(null);
    setIsEventListOpen(false);
    setIsEventModalOpen(true);
  };

  // Show landing page for unauthenticated users
  if (!authLoading && !isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-[#05050A] overflow-hidden">
      {/* Orb Background */}
      <div className="fixed top-0 left-0 w-full h-[1000px] z-0 overflow-hidden mix-blend-screen pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-40">
          <Orb hue={280} hoverIntensity={0.3} backgroundColor="#05050A" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#05050A] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="sm:hidden flex-1 px-4 pt-4 pb-28">
          <div className="mx-auto flex max-w-md flex-col gap-4">
            <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-cyan-500/[0.08] to-violet-500/[0.08] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">Today</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{mobileGreeting.title}</h2>
                  <p className="mt-1 max-w-[240px] text-sm leading-relaxed text-white/50">{mobileGreeting.subtitle}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Selected</p>
                  <p className="mt-1 text-sm font-medium text-white">{mobileSelectedEvents.length} events</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#0a0b14]/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">Revo Mobile</p>
                  <h1 className="mt-2 text-2xl font-semibold text-white">{MONTHS[currentMonth]}</h1>
                  <p className="text-sm text-white/40">{currentYear} agenda</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSyncing && (
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-2 text-cyan-300">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  <UserMenu />
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/18 via-violet-500/12 to-transparent p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">Selected day</p>
                    <p className="mt-2 text-lg font-semibold text-white">{mobileSelectedDateLabel}</p>
                    <p className="mt-1 text-sm text-white/45">{activeMobileEvents} active, {completedMobileEvents} completed</p>
                  </div>
                  <button
                    onClick={handleMobileAddEvent}
                    className="rounded-2xl bg-white text-slate-950 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-white/10 transition-transform active:scale-95"
                  >
                    New
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-black/20 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Today</p>
                    <p className="mt-1 text-lg font-semibold text-white">{stats.todayCount}</p>
                  </div>
                  <div className="rounded-2xl bg-black/20 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Month</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currentMonthEventCount}</p>
                  </div>
                  <div className="rounded-2xl bg-black/20 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Done</p>
                    <p className="mt-1 text-lg font-semibold text-white">{stats.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <SearchBar
                  events={events}
                  onEventClick={handleEditEvent}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center">
                <div />
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setNav((prev) => prev - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all active:scale-95"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setNav(0)}
                    className="rounded-2xl border border-cyan-500/20 bg-cyan-500/12 px-4 py-3 text-sm font-medium text-cyan-200 transition-all active:scale-95"
                  >
                    This month
                  </button>
                  <button
                    onClick={() => setNav((prev) => prev + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all active:scale-95"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-end">
                {isAuthenticated && encryptionSetup && (
                  <button
                    onClick={() => !encryptionUnlocked && setShowEncryptionModal(true)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-medium transition-all ${
                      encryptionUnlocked
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                        : 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {encryptionUnlocked ? 'Secure' : 'Unlock'}
                  </button>
                )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#090b13]/88 p-3 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <Calendar
                nav={nav}
                events={events}
                onDayClick={handleDayClick}
                selectedDate={mobileSelectedDate}
              />
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#090b13]/92 p-3 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <div className="mb-3 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                {([
                  { key: 'day', label: 'Day' },
                  { key: 'tools', label: 'Tools' },
                  { key: 'stats', label: 'Stats' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setMobilePanel(item.key)}
                    className={`flex-1 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all ${
                      mobilePanel === item.key
                        ? 'bg-white text-slate-950 shadow-lg shadow-white/10'
                        : 'text-white/55'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {mobilePanel === 'day' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-violet-300/70">Agenda</p>
                      <h2 className="mt-1 text-lg font-semibold text-white">{mobileSelectedDateLabel}</h2>
                    </div>
                    <button
                      onClick={handleOpenSelectedDay}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75"
                    >
                      Full day
                    </button>
                  </div>

                  {mobileSelectedEvents.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
                      <p className="text-sm text-white/60">Nothing booked for this day.</p>
                      <p className="mt-1 text-xs text-white/30">Use the add button to schedule something.</p>
                    </div>
                  ) : (
                    mobileSelectedEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEditEvent(event)}
                        className="w-full rounded-[24px] border border-white/10 bg-black/20 p-4 text-left transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_CONFIG[event.category].icon}</span>
                              <p className={`truncate text-sm font-semibold ${event.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                                {event.title}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
                              <span>{event.time ? formatTime(event.time) : 'Any time'}</span>
                              <span
                                className="rounded-full px-2 py-1 font-medium"
                                style={{
                                  backgroundColor: `${PRIORITY_CONFIG[event.priority].color}20`,
                                  color: PRIORITY_CONFIG[event.priority].color,
                                }}
                              >
                                {PRIORITY_CONFIG[event.priority].label}
                              </span>
                            </div>
                            {event.description && (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/35">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {mobilePanel === 'tools' && (
                <div className="space-y-3">
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
                    <WeatherWidget />
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
                    <FocusTimer
                      alarmSound={settings.alarmSound}
                      onAlarmSoundChange={(sound) => updateSettings({ alarmSound: sound })}
                    />
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
                    <SpotifyWidget />
                  </div>
                </div>
              )}

              {mobilePanel === 'stats' && (
                <div className="space-y-3">
                  <QuickStats stats={stats} />
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <TimezoneSelector
                      timezone={settings.timezone}
                      onTimezoneChange={(tz) => updateSettings({ timezone: tz })}
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#070910]/92 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-3 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-md items-center gap-2 rounded-[26px] border border-white/10 bg-white/[0.03] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              {([
                { key: 'day', label: 'Agenda' },
                { key: 'tools', label: 'Tools' },
                { key: 'stats', label: 'Stats' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMobilePanel(item.key)}
                  className={`flex-1 rounded-[18px] px-3 py-3 text-sm font-medium transition-all ${
                    mobilePanel === item.key
                      ? 'bg-white text-slate-950'
                      : 'text-white/55'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => router.push('/notes')}
                className="rounded-[18px] px-3 py-3 text-sm font-medium text-white/55 transition-all"
              >
                Notes
              </button>
              <button
                onClick={handleMobileAddEvent}
                className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                title="Add event"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="hidden sm:block px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo & Title */}
            <div className="flex flex-col flex-shrink-0">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 flex-shrink-0 -mb-2">
                  <Image src="/revologo.png" alt="Revo Logo" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
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

        </header>

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
        <main className="hidden sm:block flex-1 p-3 sm:p-4 lg:p-6 pt-8 sm:pt-10 lg:pt-12">
          <div className="max-w-7xl mx-auto">
            {/* Timezone Selector - Top of content */}
            <div className="mb-4">
              <TimezoneSelector
                timezone={settings.timezone}
                onTimezoneChange={(tz) => updateSettings({ timezone: tz })}
              />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
            {/* Left Sidebar - Weather, Stats & Timer (Desktop only) */}
            <aside className="w-72 flex-shrink-0 hidden lg:block space-y-4">
              <WeatherWidget />
              <QuickStats stats={stats} />
              <FocusTimer
                alarmSound={settings.alarmSound}
                onAlarmSoundChange={(sound) => updateSettings({ alarmSound: sound })}
              />
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

                <div className="sm:hidden mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Selected Day</p>
                      <p className="mt-1 text-sm font-semibold text-white">{mobileSelectedDateLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{mobileSelectedEvents.length}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">events</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-white/45">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {currentMonthEventCount} this month
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {completedMobileEvents} done
                    </span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <Calendar
                  nav={nav}
                  events={events}
                  onDayClick={handleDayClick}
                  selectedDate={mobileSelectedDate}
                />

                <div className="mt-4 sm:hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">Mobile Agenda</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{mobileSelectedDateLabel}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenSelectedDay}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition-all hover:bg-white/10"
                      >
                        Open
                      </button>
                      <button
                        onClick={handleMobileAddEvent}
                        className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-xs font-medium text-cyan-200 transition-all hover:bg-cyan-500/25"
                      >
                        Add Event
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {mobileSelectedEvents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-[#06070d] px-4 py-5 text-center">
                        <p className="text-sm text-white/55">No events scheduled</p>
                        <p className="mt-1 text-xs text-white/30">Pick another day or add a new event here.</p>
                      </div>
                    ) : (
                      mobileSelectedEvents.slice(0, 4).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEditEvent(event)}
                          className="w-full rounded-xl border border-white/10 bg-[#06070d] p-3 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{CATEGORY_CONFIG[event.category].icon}</span>
                                <p className={`truncate text-sm font-medium ${event.completed ? 'text-white/45 line-through' : 'text-white'}`}>
                                  {event.title}
                                </p>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
                                <span>{event.time ? formatTime(event.time) : 'Any time'}</span>
                                <span
                                  className="rounded-full px-1.5 py-0.5 font-medium"
                                  style={{
                                    backgroundColor: `${PRIORITY_CONFIG[event.priority].color}20`,
                                    color: PRIORITY_CONFIG[event.priority].color,
                                  }}
                                >
                                  {PRIORITY_CONFIG[event.priority].label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {mobileSelectedEvents.length > 4 && (
                    <button
                      onClick={handleOpenSelectedDay}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-all hover:bg-white/10"
                    >
                      View {mobileSelectedEvents.length - 4} more
                    </button>
                  )}
                </div>
              </div>
              
              {/* Spotify Widget - Below Calendar (Desktop only, mobile has it above) */}
              <div className="mt-4 hidden lg:block">
                <SpotifyWidget />
              </div>
            </section>

            {/* Right Sidebar - Plans & Notes */}
            <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 sm:gap-4 lg:gap-5">
              {/* Plans Header */}
              <div className="glass-card p-1 flex">
                <div className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-white/10">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Plans
                  </span>
                </div>
                <button
                  onClick={() => router.push('/notes')}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 text-white/50 hover:text-white hover:bg-white/5"
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
                <div className="h-full max-h-[400px] lg:max-h-none overflow-y-auto pr-1">
                  <UpcomingPlans
                    groupedEvents={groupedUpcomingEvents}
                    onEventClick={handleEditEvent}
                    onToggleComplete={toggleEventCompletion}
                  />
                </div>
              </div>

              {/* Keyboard Shortcuts Hint - Desktop only */}
              <div className="hidden sm:block text-center text-[10px] text-white/20 space-x-4">
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘K</kbd> Search</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘N</kbd> New Event</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> Close</span>
              </div>
            </aside>
          </div>
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
