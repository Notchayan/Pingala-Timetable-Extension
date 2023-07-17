console.log("openend");
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: "getDP"},
    function (response) {
      console.log(response);
      chrome.storage.local.set({personal_data : response }, function () {
        console.log("dp stored");
      });
    }
    );
  });
  let img=document.createElement('img');
  let personalDataDiv=document.createElement('div');
  personalDataDiv.className="personalData";
  let list=document.createElement('ul');
  chrome.storage.local.get('personal_data',(result)=>{
    let val=result.personal_data.dp;
    img.src=val;
    document.getElementsByClassName('personal')[0].appendChild(img);
    let name=document.createElement('li');
    name.innerHTML="Name : "+"<b>"+result.personal_data.name+"</b>";
    list.appendChild(name);
    let roll_no=document.createElement('li');
    roll_no.innerHTML="Roll Number : "+"<b>"+result.personal_data.roll_no+"</b>";
    list.appendChild(roll_no);
    let programme=document.createElement('li');
    programme.innerHTML="Programme : "+"<b>"+result.personal_data.programme+"</b>";
    list.appendChild(programme);
    let dept=document.createElement('li');
    dept.innerHTML="Department : " + "<b>"+result.personal_data.dept+"</b>";
    list.appendChild(dept);
    let sem=document.createElement('li');
    sem.innerHTML="Semester : " + "<b>"+result.personal_data.sem+"</b>";
    list.appendChild(sem);
    let appliedCredits=document.createElement('li');
    appliedCredits.innerHTML="Applied Credits: "+"<b>"+result.personal_data.appliedCredits+"</b>";
    list.appendChild(appliedCredits);
    personalDataDiv.appendChild(list);
    document.getElementsByClassName('personal')[0].appendChild(personalDataDiv);
    document.getElementsByTagName('ul')[0].style="list-style-type:none;padding:0px;padding-left:15px;margin:0px;";
    document.getElementsByTagName('img')[0].style="border-radius:100%;width:95px;height:95px;object-fit:cover;object-position:0% 0%;margin-top:auto;margin-bottom:auto;";
  });


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