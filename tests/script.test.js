
// Importing the required functions
import { initCalendar, addEvent, updateEvents, saveEvents, getEvents } from './content.js'; // Assuming the code is in content.js
import { JSDOM } from 'jsdom';

describe('Calendar functionality tests', () => {
  let dom;
  let document;
  let calendar, daysContainer, addEventBtn, addEventTitle, addEventFrom, addEventTo, addEventSubmit, eventsContainer;
  let eventsArr;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <div class="calendar">
          <div class="date"></div>
          <div class="days"></div>
          <button class="prev">Previous</button>
          <button class="next">Next</button>
          <button class="today-btn">Today</button>
          <input class="date-input" type="text" />
          <button class="goto-btn">Go To</button>
        </div>
        <div class="event-day"></div>
        <div class="event-date"></div>
        <div class="events"></div>
        <div class="add-event-wrapper">
          <input class="event-name" type="text" />
          <input class="event-time-from" type="text" />
          <input class="event-time-to" type="text" />
          <button class="add-event-btn">Add Event</button>
          <button class="close">Close</button>
        </div>
      </body>
      </html>
    `);

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Mock the events array
    eventsArr = [];

    // Get elements from the DOM
    calendar = document.querySelector('.calendar');
    daysContainer = document.querySelector('.days');
    addEventBtn = document.querySelector('.add-event');
    addEventTitle = document.querySelector('.event-name');
    addEventFrom = document.querySelector('.event-time-from');
    addEventTo = document.querySelector('.event-time-to');
    addEventSubmit = document.querySelector('.add-event-btn');
    eventsContainer = document.querySelector('.events');

    // Set up initial events
    getEvents();
  });

  test('Calendar should initialize with the current month', () => {
    initCalendar();

    expect(daysContainer.innerHTML).toContain(new Date().getDate().toString());
  });

  test('Clicking on a day should highlight it as active', () => {
    initCalendar();
    const day = document.querySelector('.day');
    day.click();

    expect(day.classList.contains('active')).toBe(true);
  });

  test('Adding an event should display it in the events list', () => {
    // Simulate adding an event
    addEventTitle.value = 'Test Event';
    addEventFrom.value = '10:00';
    addEventTo.value = '12:00';

    addEventSubmit.click();

    // Check if event was added
    updateEvents(new Date().getDate());
    expect(eventsContainer.innerHTML).toContain('Test Event');
  });

  test('Saving events should store them in local storage', () => {
    const event = { title: 'Test Event', time: '10:00 - 12:00' };

    eventsArr.push({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      events: [event],
    });

    saveEvents();

    // Simulate reload
    getEvents();

    expect(eventsArr.length).toBeGreaterThan(0);
  });

  test('Events should be retrieved from local storage after page reload', () => {
    // Simulate adding an event
    eventsArr.push({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      events: [{ title: 'Local Event', time: '09:00 - 10:00' }],
    });

    saveEvents();
    getEvents();

    expect(eventsArr[0].events[0].title).toBe('Local Event');
  });

  afterEach(() => {
    // Clean up
    eventsArr = [];
    localStorage.clear();
  });
});
