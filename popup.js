chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id,{action: "getPersonalData"},function (response) {
      console.log(response);
      chrome.storage.local.set({personal_data : response }, function () {
        console.log("Personal data stored");
      });
    }
    );
  });
  let personalDataDiv=document.createElement('div');
  personalDataDiv.classList.add("personalData");
  let imgDiv=document.createElement('div');
  let imgDivBox=document.createElement('div');
  imgDiv.classList.add("imgDiv");
  imgDivBox.classList.add("imgDivBox");
  let img=document.createElement('img');
  let nameDiv=document.createElement('div');
  let listDiv=document.createElement('div');
  nameDiv.classList.add('nameDiv');
  listDiv.classList.add('listDiv');
  let n=document.createElement('h1');
  let r=document.createElement('h3');
  let list=document.createElement('ul');
  list.classList.add('list');
  chrome.storage.local.get('personal_data',(result)=>{
    n.innerHTML="<b>"+result.personal_data.name+"</b>";
    r.innerHTML="<b>"+result.personal_data.roll_no+"</b>";
    nameDiv.appendChild(n);
    nameDiv.appendChild(r);
    personalDataDiv.appendChild(nameDiv);
    let val=result.personal_data.dp;
    img.src=val;
    imgDiv.appendChild(imgDivBox);
    imgDiv.appendChild(img);
    document.getElementsByClassName('personal')[0].appendChild(imgDiv);
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
    listDiv.appendChild(list);
    personalDataDiv.appendChild(listDiv);
    document.getElementsByClassName('personal')[0].appendChild(personalDataDiv);
    document.getElementsByTagName('img')[0].style="border-radius:100%;width:110px;height:110px;object-fit:cover;object-position:0% 0%;margin-top:auto;margin-bottom:auto;";
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