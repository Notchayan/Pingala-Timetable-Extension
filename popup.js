document.getElementById('updateBtn').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: 'GetTT', tabId: tab.id });
});


document.getElementById('timetableBtn').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: 'ShowTT', tabId: tab.id });
});


document.getElementById('upcomingClass').addEventListener('click',async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.runtime.sendMessage({ action: 'upcomingClass', tabId: tab.id });
});