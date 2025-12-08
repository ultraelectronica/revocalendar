'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import EventListModal from '@/components/EventListModal';
import FloatingLines from '@/components/FloatingLines';
import UpcomingPlans from '@/components/UpcomingPlans';
import NotesSection from '@/components/NotesSection';
import SearchBar from '@/components/SearchBar';
import QuickStats from '@/components/QuickStats';
import MiniCalendar from '@/components/MiniCalendar';
import { useEvents } from '@/hooks/useEvents';
import { useNotes } from '@/hooks/useNotes';
import { CalendarEvent } from '@/types';
import { MONTHS } from '@/utils/dateUtils';

export default function Home() {
  const [nav, setNav] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'plans' | 'notes'>('plans');

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
    getEventsForDate 
  } = useEvents();
  
  const { 
    notes, 
    updateNotes, 
    isSaving, 
    charCount, 
    wordCount 
  } = useNotes();

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

  const handleMiniCalendarChange = (month: number, year: number) => {
    const today = new Date();
    const targetDate = new Date(year, month, 1);
    const currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthDiff = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                      (targetDate.getMonth() - currentDate.getMonth());
    setNav(monthDiff);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden aurora-bg">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <FloatingLines 
          linesGradient={['#06b6d4', '#8b5cf6', '#f97316', '#10b981']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[5, 7, 5]}
          animationSpeed={0.8}
          interactive={true}
          parallax={true}
          mixBlendMode="screen"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">LiveCalendar</h1>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Plan • Track • Achieve</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <SearchBar 
                events={events}
                onEventClick={handleEditEvent}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(`${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="btn-primary flex items-center gap-2"
                title="Quick add event (⌘N)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Event</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto flex gap-6 h-full">
            {/* Left Sidebar - Stats & Mini Calendar */}
            <aside className="w-72 flex-shrink-0 space-y-5 hidden lg:block">
              {/* Quick Stats */}
              <QuickStats stats={stats} />
              
              {/* Mini Calendar */}
              <MiniCalendar
                currentMonth={currentMonth}
                currentYear={currentYear}
                events={events}
                onDateClick={handleDayClick}
                onMonthChange={handleMiniCalendarChange}
              />
            </aside>

            {/* Main Calendar */}
            <section className="flex-1 min-w-0">
              <div className="glass-card p-5 h-full">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white text-glow-cyan">
                      {MONTHS[currentMonth]}
                    </h2>
                    <p className="text-sm text-white/40">{currentYear}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setNav(0)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-l-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setNav(prev => prev + 1)}
                        className="px-3 py-2 bg-white/5 border border-white/10 border-l-0 rounded-r-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
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
            <aside className="w-80 flex-shrink-0 flex flex-col gap-5">
              {/* Tab Switcher */}
              <div className="glass-card p-1 flex">
                <button
                  onClick={() => setSidebarTab('plans')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
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
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
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
              <div className="glass-card p-4 flex-1 overflow-hidden">
                {sidebarTab === 'plans' ? (
                  <div className="h-full overflow-y-auto pr-1">
                    <UpcomingPlans
                      groupedEvents={groupedUpcomingEvents}
                      onEventClick={handleEditEvent}
                      onToggleComplete={toggleEventCompletion}
                    />
                  </div>
                ) : (
                  <NotesSection
                    notes={notes}
                    onNotesChange={updateNotes}
                    isSaving={isSaving}
                    charCount={charCount}
                    wordCount={wordCount}
                  />
                )}
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="text-center text-[10px] text-white/20 space-x-4">
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
    </div>
  );
}
