let nav = 0;
let clicked = null;
let editingEventId = null;
let selectedColor = '#3b82f6';
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

// Constant Values
const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const eventListModal = document.getElementById('eventListModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventTimeInput = document.getElementById('eventTimeInput');
const eventDescriptionInput = document.getElementById('eventDescriptionInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate unique ID for events
function generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date string consistently
function formatDateString(month, day, year) {
    return `${month + 1}/${day}/${year}`;
}

// Get events for a specific date
function getEventsForDate(date) {
    return events.filter(e => e.date === date);
}

// Open event list modal for a date
function openEventListModal(date) {
    clicked = date;
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-us', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('eventListTitle').innerText = `Events - ${formattedDate}`;
    
    const eventsForDay = getEventsForDate(date);
    const eventListContent = document.getElementById('eventListContent');
    
    if (eventsForDay.length === 0) {
        eventListContent.innerHTML = '<p class="no-events">No events for this day. Click "Add Event" to create one.</p>';
    } else {
        eventListContent.innerHTML = eventsForDay.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-item-header">
                    <div class="event-color-indicator" style="background-color: ${event.color || '#3b82f6'}"></div>
                    <div class="event-item-info">
                        <div class="event-item-title">${event.title}</div>
                        ${event.time ? `<div class="event-item-time">${event.time}</div>` : ''}
                    </div>
                </div>
                ${event.description ? `<div class="event-item-description">${event.description}</div>` : ''}
                <div class="event-item-actions">
                    <button class="btn-edit" onclick="editEvent('${event.id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    eventListModal.style.display = 'block';
    backDrop.style.display = 'block';
}

// Open new event modal
function openNewEventModal() {
    editingEventId = null;
    eventTitleInput.value = '';
    eventTimeInput.value = '';
    eventDescriptionInput.value = '';
    selectedColor = '#3b82f6';
    updateColorSelection();
    document.getElementById('modalTitle').innerText = 'New Event';
    newEventModal.style.display = 'block';
}

// Edit event
function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    editingEventId = eventId;
    clicked = event.date;
    eventTitleInput.value = event.title;
    eventTimeInput.value = event.time || '';
    eventDescriptionInput.value = event.description || '';
    selectedColor = event.color || '#3b82f6';
    updateColorSelection();
    document.getElementById('modalTitle').innerText = 'Edit Event';
    
    eventListModal.style.display = 'none';
    newEventModal.style.display = 'block';
}

// Update color selection UI
function updateColorSelection() {
    document.querySelectorAll('.color-option').forEach(option => {
        if (option.dataset.color === selectedColor) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Function for loading calendar
function load() {
    const dt = new Date();

    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }

    const today = new Date();
    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById('monthDisplay').innerText =
        `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        if (i > paddingDays) {
            const currentDay = i - paddingDays;
            const dayString = formatDateString(month, currentDay, year);
            
            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.innerText = currentDay;
            daySquare.appendChild(dayNumber);

            // Check if this is today
            if (currentDay === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear() && 
                nav === 0) {
                daySquare.classList.add('today');
            }

            // Add events for this day
            const eventsForDay = getEventsForDate(dayString);
            if (eventsForDay.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.classList.add('events-container');
                
                // Show up to 3 events, with indicator for more
                const eventsToShow = eventsForDay.slice(0, 3);
                eventsToShow.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.style.backgroundColor = event.color || '#3b82f6';
                    eventDiv.innerText = event.title;
                    eventsContainer.appendChild(eventDiv);
                });
                
                if (eventsForDay.length > 3) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.classList.add('event-more');
                    moreIndicator.innerText = `+${eventsForDay.length - 3} more`;
                    eventsContainer.appendChild(moreIndicator);
                }
                
                daySquare.appendChild(eventsContainer);
            }

            daySquare.addEventListener('click', () => openEventListModal(dayString));
        } else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}


// Function for closing modals
function closeModal() {
    eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    eventListModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitleInput.value = '';
    eventTimeInput.value = '';
    eventDescriptionInput.value = '';
    editingEventId = null;
    clicked = null;
    load();
}

// Function for saving an event
function saveEvent() {
    if (!eventTitleInput.value.trim()) {
        eventTitleInput.classList.add('error');
        return;
    }

    eventTitleInput.classList.remove('error');

    const eventData = {
        id: editingEventId || generateEventId(),
        date: clicked,
        title: eventTitleInput.value.trim(),
        time: eventTimeInput.value || null,
        description: eventDescriptionInput.value.trim() || null,
        color: selectedColor
    };

    if (editingEventId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = eventData;
        }
    } else {
        // Add new event
        events.push(eventData);
    }

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}

// Function for deleting an event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== eventId);
        localStorage.setItem('events', JSON.stringify(events));
        
        // If event list modal is open, refresh it
        if (eventListModal.style.display === 'block' && clicked) {
            openEventListModal(clicked);
        } else {
            closeModal();
        }
    }
}

// Function for initializing buttons
function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

    document.getElementById('todayButton').addEventListener('click', () => {
        nav = 0;
        load();
    });

    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton').addEventListener('click', closeModal);
    document.getElementById('closeModalButton').addEventListener('click', closeModal);
    document.getElementById('closeEventListButton').addEventListener('click', closeModal);
    document.getElementById('closeEventListModalButton').addEventListener('click', closeModal);
    document.getElementById('addEventButton').addEventListener('click', () => {
        eventListModal.style.display = 'none';
        openNewEventModal();
    });

    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            selectedColor = option.dataset.color;
            updateColorSelection();
        });
    });

    // Close modal on backdrop click
    backDrop.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Allow Enter key to save in title input
    eventTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEvent();
        }
    });
}

// Make functions globally available for inline event handlers
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

initButtons();
load();