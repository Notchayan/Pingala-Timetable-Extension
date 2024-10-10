// backend.test.js

// Mocking Chrome API
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    sendMessage: jest.fn(),
    executeScript: jest.fn()
  },
  notifications: {
    create: jest.fn()
  }
};

const { setNotification, showTT, Notify_urgent, Notify_15, Notify_no_class, calculateTimeDifference } = require('./background.js');

// Mocking data for tests
const mockTimetable = {
  Monday: [
    { time: "10:00 AM", time_end: "11:00 AM", title: "Maths 101 - Lecture" },
    { time: "02:00 PM", time_end: "03:00 PM", title: "Physics 101 - Practical" }
  ],
  Tuesday: []
};

beforeEach(() => {
  jest.clearAllMocks(); // Clear previous mock data
});

describe('background.js test cases', () => {

  test('setNotification should send notifications for upcoming classes', async () => {
    const mockCurrentTime = new Date('2024-10-10T09:45:00');  // Mock current time
    global.Date = jest.fn(() => mockCurrentTime);  // Mock the Date constructor

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ timetable: mockTimetable });
    });

    // Call setNotification function
    await setNotification();

    // Check if notifications were created
    expect(chrome.notifications.create).toHaveBeenCalled();
    expect(chrome.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'basic',
      title: 'Upcoming Class Reminder',
      message: 'Your class "Maths 101 - Lecture" is starting in 15 minutes at 10:00 AM.',
    }));
  });

  test('setNotification should notify "No Class Today" if no classes are scheduled', async () => {
    const mockCurrentTime = new Date('2024-10-10T09:45:00');  // Mock current time
    global.Date = jest.fn(() => mockCurrentTime);  // Mock the Date constructor

    // Simulating no classes on Tuesday
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ timetable: { Tuesday: [] } });
    });

    // Call setNotification function
    await setNotification();

    // Check if the "No Class Today" notification was triggered
    expect(chrome.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'basic',
      title: 'No Class Today',
      message: 'You have no classes today!',
    }));
  });

  test('showTT should display the timetable in the current tab', async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ timetable: mockTimetable });
    });

    // Call showTT function
    await showTT();

    // Check if executeScript was called to inject the timetable
    expect(chrome.tabs.executeScript).toHaveBeenCalledWith(expect.objectContaining({
      code: expect.stringContaining('<table class="timetable-table">')
    }));
  });

  test('calculateTimeDifference should return the correct time difference', () => {
    const classTime = new Date('2024-10-10T10:00:00');
    const timeDiff = calculateTimeDifference(classTime, 0);

    // Time difference in milliseconds
    expect(timeDiff).toBeGreaterThan(0);  // Assert class starts in the future
  });

  test('Notify_urgent should create an urgent notification', () => {
    const classTime = new Date('2024-10-10T10:00:00');
    const title = "Maths 101 - Lecture";

    Notify_urgent(classTime, title);

    expect(chrome.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'basic',
      title: 'Class Starting Soon!',
      message: 'Your class "Maths 101 - Lecture" is starting in less than 15 minutes at 10:00 AM.',
      priority: 2
    }));
  });

  test('Notify_15 should create a 15 minutes reminder notification', () => {
    const classTime = new Date('2024-10-10T10:00:00');
    const title = "Physics 101 - Practical";

    Notify_15(classTime, title);

    expect(chrome.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'basic',
      title: 'Upcoming Class Reminder',
      message: 'Your class "Physics 101 - Practical" is starting in 15 minutes at 10:00 AM.',
      priority: 1
    }));
  });

  test('Notify_no_class should notify when there are no classes for the day', () => {
    Notify_no_class();

    expect(chrome.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      type: 'basic',
      title: 'No Class Today',
      message: 'You have no classes today!',
      priority: 1
    }));
  });
});
