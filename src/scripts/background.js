/**
 * This background.js script enhances the "Class Hai Bhai!" Chrome extension, which manages student timetables
 * and provides timely class notifications.
 *
 * 1. It dynamically generates a timetable based on data fetched from Pingala, IITK's Academic Management Portal.
 * 2. For each class, it calculates the time difference from the current time and displays relevant class information.
 * 3. It uses Chrome's notification API to notify the user about upcoming classes:
 *    - Urgent notifications for classes starting in less than 15 minutes.
 *    - Reminder notifications 15 minutes before class starts.
 *    - No class notifications when there are no scheduled classes for the day.
 * 4. The timetable is presented as an HTML table injected into the current tab, styled based on class times and statuses.
 * 5. Helper functions are used to calculate the time difference between current time and class time.
 * 6. It provides visual cues in the timetable for lecture continuity, highlighting upcoming or ongoing classes.
 * 7. The script listens for user interactions and handles scheduling notifications based on live data.
 */


// Handle extension installation event
chrome.runtime.onInstalled.addListener(() => {
  chrome.windows.create({
    url: 'popup_once/popup_once.html',  // Open the popup window upon installation
    type: 'popup',
    width: 400,
    height: 300
  });
});

// Handle extension startup event
chrome.runtime.onStartup.addListener(function() {
  setNotification();  // Set notifications when Chrome starts
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  // Handle 'GetTT' and 'FormTT' actions
  if (request.action === 'GetTT' || request.action === 'FormTT') {
    const messageType = request.action === 'GetTT' ? 'GetTT' : 'FormTT';
    
    // Send message to the content script to fetch the timetable
    chrome.tabs.sendMessage(request.tabId, { action: messageType }, function (response) {
      let timetable = response.timetable;
      let personal_data = response.personal_data;

      // If timetable is empty, notify the user
      if (!(Object.keys(timetable).length)) {
        chrome.runtime.sendMessage({ action: 'Error_Fetch_Timetable' });
        return;
      }

      // Store the fetched timetable and personal data in local storage
      chrome.storage.local.set({ timetable: timetable, personal_data: personal_data }, function () {
        console.log('Timetable and Personal Data stored in Chrome Storage:', timetable, personal_data);
        setNotification();  // Set the notification after storing data
      });

      chrome.runtime.sendMessage({ action: "true" });
    });
  }

  // Show timetable in the UI
  if (request.action === 'ShowTT') {
    showTT();
  }

  // Handle 'upcomingClass' action
  if (request.action === 'upcomingClass') {
    upcomingClass();
  }

  // Handle 'LHC' action for fetching and processing course data
  if (request.action === 'LHC') {
    chrome.storage.local.get(['timetable'], function (response) {
      const timetable = response.timetable;
      const courses = new Set();

      // Extract courses from timetable data
      for (let day in timetable) {
        timetable[day].forEach((element) => {
          let x = element.title;
          x = x.slice(x.indexOf('-') + 1);  // Extract course code
          courses.add(x);
        });
      }

      // Send the list of courses to the content script
      chrome.tabs.sendMessage(request.tabId, { action: 'LHC', courses: Array.from(courses) });
    });
  }

  // Handle 'LHCData' action for storing LHC data
  if (request.action === 'LHCData') {
    let LHC = request.data;
    chrome.storage.local.set({ LHC: LHC });
  }

  // Handle alerts
  if (request.action === 'alert') {
    chrome.runtime.sendMessage({ action: request.alert_type });
  }
});

// Function to set notifications based on the user's timetable
function setNotification() {
  chrome.storage.local.get(['timetable'], function (result) {
    let currentDate = new Date();

    // If it's weekend, exit the function
    if (currentDate.getDay() > 5) {
      return;
    }

    let storedData = result.timetable;
    storedData = Convert(storedData);
    let x = storedData[Day(currentDate.getDay() - 1)];
    let noClass = true;

    // Iterate through today's classes to check for upcoming class
    for (let i = 0; i < x.length; i++) {
      const classTime = new Date(x[i].time);
      const title = x[i].title;

      // If class starts soon, notify user
      if (calculateTimeDifference(classTime, 0)) {
        noClass = false;
        if (calculateTimeDifference(classTime, 0) < 15 * 60 * 1000) {
          Notify_urgent(classTime, title);
        } else {
          Notify_15(classTime, title);
        }
        return;
      }
    }

    // If no upcoming class found, notify user
    if (noClass) {
      Notify_no_class();
    }
  });
}

// Function to show the user's timetable in a new tab
function showTT() {
  chrome.storage.local.get(['timetable'], function (result) {
    let storedData = result.timetable;
    let n = [0, 0, 0, 0, 0];  // Array to track number of classes for each day
    let tableHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap" rel="stylesheet">
      <div style=" display: flex; align-items: center; justify-content: space-around; flex-direction: column; font-family: 'Quicksand', sans-serif;">
        <div style="font-size: min(7vw,50px); padding: min(.4rem,20px); width: 100%; text-align: center;">
          CLASS SCHEDULE
        </div>
        <table class="timetable-table" style=" text-align: center; overflow: hidden; width: min(100%,80rem); max-height: 100%; border-spacing: 0; border-collapse: collapse; border-radius: 16px; background-color: rgb(243, 243, 243);">
          <tr>
            <th style="height: min(6vh,40x); border: 2px solid white; width: auto; padding: 4px;"></th>
            <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Monday</th>
            <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Tuesday</th>
            <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Wednesday</th>
            <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Thursday</th>
            <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Friday</th>
          </tr>`;

    // Iterate through the timetable and generate HTML rows for each time slot
    for (let i = 8; i <= 18; i++) {
      let color;
      let width;
      tableHTML += `<tr>`;
      tableHTML += `
        <td style="font-weight: bold; width: auto; color: gray; height: min(7vh,90px);border: 2px solid white; padding: 8px; white-space: nowrap;">
        ${i == 12 ? 12 : i % 12}:00 ${i < 12 ? 'AM' : 'PM'}
        </td>`;

      // Iterate through days (Monday to Friday)
      for (let j = 0; j < 5; j++) {
        const day = Day(j);
        const classes = storedData[day];
        let Class = [];
        let type;
        let conti_Class;
        let end_slot;
        let start_hour;
        let end_hour;

        // Extract and process class timings
        classes.forEach(data => {
          const strat_num = data.time.slice(0, 2);
          const end_num = data.time_end.slice(0, 2);
          const start_sun = data.time.slice(-2);
          const end_sun = data.time_end.slice(-2);
          type = data.title.slice(0, 3);
          start_hour = parseInt(strat_num) || parseInt(data.time[0]);
          end_hour = parseInt(end_num) || parseInt(data.time_end[0]);

          // Convert to 24-hour time format if necessary
          if (start_sun == 'PM' && start_hour != 12) {
            start_hour += 12;
          }
          if (end_sun == 'PM' && end_hour != 12) {
            end_hour += 12;
          }

          // Handle lecture vs class type
          if (start_hour == i && type == "Prc") {
            Class.push(data.title);
            color = "#9f70b8";  // Purple color for practicals
          } else if (start_hour == i) {
            Class.push(data.title);
            color = "#368fb6";  // Blue color for lectures
          }

          // Track number of classes for each day
          if (Class.length > 0) {
            n[j] = Class.length;
          }

          // Handle continuing classes
          for (let k = 1; k < end_hour - start_hour; k++) {
            if (start_hour + k == i && type == "Prc") {
              conti_Class = 1;
              color = "#9f70b8";
            } else if (start_hour + k == i && (type == "Tut" || type == "Lec")) {
              conti_Class = 1
              color = "#368fb6";  
            }
          }
        });

        // Display the class information for the current time slot
        if (Class.length > 0 || conti_Class) {
          tableHTML += `
            <td style="background-color: ${color}; color: white; text-align: left; padding: 8px; width: auto; border: 2px solid white;">
              <div style="max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${Class.join('<br>')}
              </div>
            </td>`;
        } else {
          tableHTML += `
            <td style="background-color: white; color: black; text-align: left; padding: 8px; width: auto; border: 2px solid white;">
              No Classes
            </td>`;
        }
      }
      tableHTML += `</tr>`;
    }

    // Close the table and div elements
    tableHTML += `
        </table>
      </div>`;

    // Insert the table HTML into the current tab
    chrome.tabs.executeScript({ code: `document.body.innerHTML = \`${tableHTML}\`;` });
  });
}

// Helper function to calculate the time difference between the current time and a class
function calculateTimeDifference(classTime, adjustment) {
  const now = new Date();
  const diff = classTime - now;
  return diff + adjustment;
}

// Function to notify user about upcoming classes
function Notify_urgent(classTime, title) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/urgent.png',
    title: 'Class Starting Soon!',
    message: `Your class "${title}" is starting in less than 15 minutes at ${classTime.toLocaleTimeString()}.`,
    priority: 2
  });
}

// Function to notify user about a class 15 minutes before it starts
function Notify_15(classTime, title) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/warning.png',
    title: 'Upcoming Class Reminder',
    message: `Your class "${title}" is starting in 15 minutes at ${classTime.toLocaleTimeString()}.`,
    priority: 1
  });
}

// Function to notify user when there's no class today
function Notify_no_class() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/no_class.png',
    title: 'No Class Today',
    message: 'You have no classes today!',
    priority: 1
  });
}
