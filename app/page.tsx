'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import EventListModal from '@/components/EventListModal';
import FloatingLines from '@/components/FloatingLines';
import UpcomingPlans from '@/components/UpcomingPlans';
import NotesSection from '@/components/NotesSection';
import { useEvents } from '@/hooks/useEvents';
import { useNotes } from '@/hooks/useNotes';
import { CalendarEvent } from '@/types';

export default function Home() {
  const [nav, setNav] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const { events, addEvent, updateEvent, deleteEvent, getEventsForDate } = useEvents();
  const { notes, updateNotes } = useNotes();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEventListOpen(false);
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDate(null);
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
    // Refresh the event list if modal is still open
    if (isEventListOpen && selectedDate) {
      const remainingEvents = getEventsForDate(selectedDate);
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

  const goToToday = () => {
    setNav(0);
  };

  const goToNextMonth = () => {
    setNav(prev => prev + 1);
  };

  const goToPrevMonth = () => {
    setNav(prev => prev - 1);
  };

  const getMonthDisplay = () => {
    const dt = new Date();
    if (nav !== 0) {
      dt.setMonth(new Date().getMonth() + nav);
    }
    return `${dt.toLocaleDateString('en-us', { month: 'long' })} ${dt.getFullYear()}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-5 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[6, 6, 6]}
          animationSpeed={1}
          interactive={true}
          parallax={true}
          mixBlendMode="screen"
        />
      </div>
      <div className="w-full max-w-7xl mx-auto mt-5 relative z-10 flex gap-5">
        {/* Calendar Section - Centered */}
        <div className="flex-1 bg-white/10 backdrop-blur-[50px] rounded-3xl border border-white/30 shadow-2xl p-4">
          <div className="flex justify-between items-center mb-3 px-2">
            <div className="text-white text-2xl font-semibold">
              {getMonthDisplay()}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={goToToday}
                className="min-w-[45px] px-4 py-2 bg-white/10 shadow-md border border-white/20 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg"
                title="Go to today"
              >
                Today
              </button>
              <button
                onClick={goToPrevMonth}
                className="min-w-[40px] px-3 py-2 bg-white/10 shadow-md border border-white/20 rounded-lg text-white transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg"
                title="Previous month"
              >
                ‹
              </button>
              <button
                onClick={goToNextMonth}
                className="min-w-[40px] px-3 py-2 bg-white/10 shadow-md border border-white/20 rounded-lg text-white transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg"
                title="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <Calendar
            nav={nav}
            events={events}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Right Sidebar - Upcoming Plans & Notes */}
        <div className="w-80 flex flex-col gap-5">
          {/* Upcoming Plans */}
          <div className="bg-white/10 backdrop-blur-[50px] rounded-3xl border border-white/30 shadow-2xl p-4">
            <h3 className="text-white font-semibold text-lg mb-3">Upcoming Plans</h3>
            <div className="max-h-[400px] overflow-y-auto">
              <UpcomingPlans
                events={events}
                onEventClick={handleEditEvent}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white/10 backdrop-blur-[50px] rounded-3xl border border-white/30 shadow-2xl p-4 flex-1 min-h-[300px]">
            <NotesSection
              notes={notes}
              onNotesChange={updateNotes}
            />
          </div>
        </div>
      </div>

      <EventListModal
        isOpen={isEventListOpen}
        onClose={handleCloseModals}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
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

