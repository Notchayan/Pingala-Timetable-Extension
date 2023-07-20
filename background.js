chrome.runtime.onInstalled.addListener(() => {
  chrome.windows.create({
    url: 'popup_once/popup_once.html',
    type: 'popup',
    width: 400,
    height: 300
  });
});


chrome.runtime.onStartup.addListener(function() {
  setNotification();
});


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.action === 'GetTT') {
    chrome.tabs.sendMessage(request.tabId, { action: 'GetTT' }, function(response) {
      let timetable = response.timetable;
      if(!(Object.keys(timetable).length)){
        return
      }
      chrome.storage.local.set({ timetable: timetable}, function() {
        console.log('Timetable stored in Chrome Storage:', timetable)
        console.log("Timetable has been saved")
        setNotification();
      })
    });
  }
  if(request.action === 'ShowTT') {
    showTT();
  }
  if(request.action === 'upcomingClass') {
    upcomingClass();
  }
});


function setNotification(){
  chrome.storage.local.get(['timetable'], function(result) {
    let storedData = result.timetable
    storedData = Convert(storedData)
    let currentDate = new Date()
    let x = storedData[Day(currentDate.getDay()-1)]
    let p = 1
    for(let i=0; i<x.length; i++){
      const ClassTime = new Date(x[i].time)
      title = x[i].title
      if(calculateTimeDifference(ClassTime, 0)){
        p = 0
        if(calculateTimeDifference(ClassTime,0) < 15*60*1000){
          Notify_urgent(ClassTime, title);
          return
        }
        else{
          Notify_15(ClassTime,title);
          return
        }
      }
    }
    if(p){
      Notify_no_class();
      return
    }
  });
}


function upcomingClassNotif(NxtClass){
  chrome.notifications.create('notificationId', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: NxtClass.title + ' will start from ' + NxtClass.time
  }, function(notificationId_u) {
    console.log('Notification created with ID:', notificationId_u);
  });
}


function upcomingClass(){
  chrome.storage.local.get(['timetable'], function(result) {
    let storedData = result.timetable
    stored = Convert(storedData)
    let currentDate = new Date()
    let curDay = Day(currentDate.getDay()-1)
    let x = stored[curDay]
    let p = 1
    for(let i=0; i<x.length; i++){
      const ClassTime = new Date(x[i].time)
      if(calculateTimeDifference(ClassTime,0)){
        p = 0
        upcomingClassNotif(storedData[curDay][i]);
        return
      }
    }
    if(p){
      Notify_no_class();
      return
    }
  });
}


function showTT(){
  chrome.storage.local.get(['timetable'], function(result) {
    let storedData = result.timetable
    tableHTML = '<table style="border-collapse: collapse; width: 100%;">';
    tableHTML += '<tr><th style="border: 1px solid black; padding: 8px;">Day</th><th style="border: 1px solid black; padding: 8px;">Time</th><th style="border: 1px solid black; padding: 8px;">Title</th></tr>';
    const days = []
    for(let i=0; i<5; i++){
      days.push(Day(i))
    }
    let i = 0
    days.forEach(day  => {
      i = i+1
      const dataArray = storedData[day]
      dataArray.forEach(data => {
        const time = data.time
        const title = data.title
        tableHTML += `<tr><td style="border: 1px solid black; padding: 8px;">${day}</td><td style="border: 1px solid black; padding: 8px;">${time}</td><td style="border: 1px solid black; padding: 8px;">${title}</td></tr>`;
      });
      if (i !== days.length) {
        tableHTML += '<tr><td colspan="3" style="border: none; height: 10px;"></td></tr>';
      }
    });
    tableHTML += '</table>'
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(tableHTML) });
  });
}

function Convert(storedData){
  let NotifTable = {}
  for(let i=0; i<5; i++){
    let x = storedData[Day(i)]
    let length = x.length
    for(let j=0; j< length; j++){
      if (!NotifTable.hasOwnProperty(Day(i))){
        NotifTable[Day(i)] = []
      }
      let currentDate = new Date()
      let time = x[j].time
      let title = x[j].title
      time = new Date(currentDate.toDateString() + " " + time)
      NotifTable[Day(i)].push({ time: time, title: title })
    }
  }
  return NotifTable
}


function Notify_urgent(ClassTime, title){
  chrome.notifications.create('Upcoming Class soon', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: 'Hurry!! ' + title + ' will start soon.',
  }, function(notificationId) {
    console.log('Notification created with ID:', notificationId);
  });
  setTimeout(function () {
    setNotification();
  }, calculateTimeDifference(ClassTime,-1));
}


function Notify_15(ClassTime, title){
  const timeDifference = calculateTimeDifference(ClassTime,15);
  console.log(ClassTime)
  console.log(timeDifference)
  setTimeout(function() {
    chrome.notifications.create('upcoming Class in 15 min', {
      type: 'basic',
      iconUrl: 'icons/1188045.png',
      title: 'Class Reminder',
      message: title + ' class is going to start in 15 minutes.',
    }, function(notificationId) {
      console.log('Notification created with ID:', notificationId);
    });
  }, timeDifference);
  setTimeout(function () {
    setNotification();
  }, calculateTimeDifference(ClassTime,-1));
}


function Notify_no_class(){
  chrome.notifications.create('No Upcoming Class', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: 'You have no upcoming class today.',
  }, function(notificationId) {
    console.log('Notification created with ID:', notificationId);
  });
  setTimeout(function() {
    setNotification();
  },60*60*1000);
}


function calculateTimeDifference(targetTime, x) {
  const currentTime = new Date().getTime();
  const targetTimestamp = new Date(targetTime).getTime() - x*60*1000;
  const timeDifference = targetTimestamp - currentTime;
  return timeDifference > 0 ? timeDifference : 0;
}


function Day(i){
  if(i == 0){
      return "Monday"
  }
  if(i == 1){
      return "Tuesday"
  }
  if(i == 2){
      return "Wednesday"
  }
  if(i == 3){
      return "Thursday"
  }
  if(i == 4){
      return "Friday"
  }
}
