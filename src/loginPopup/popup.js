document.addEventListener('DOMContentLoaded', function() {
  const visitBtn = document.getElementById('visitBtn');
  visitBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://pingala.iitk.ac.in/IITK-0/login' });
    window.close();
  });
});
