function getPersonalData(){
    let dp=document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    let name=document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();
    let str=document.getElementsByClassName('content-header')[0]
                     .getElementsByClassName('breadcrumb')[0]
                     .getElementsByTagName('li')[1].innerText;
    let roll_no=document.getElementsByClassName('row col-lg-12')[0].getElementsByClassName('col-lg-6')[0].getElementsByTagName('div')[0].innerText;
    let programme=document.getElementsByClassName('row col-lg-12')[0].getElementsByClassName('col-lg-6')[1].getElementsByTagName('div')[0].innerText;
    let dept=document.getElementsByClassName('row col-lg-12')[2].getElementsByClassName('col-lg-6')[0].getElementsByTagName('div')[0].innerText;
    let appliedCredits=document.getElementsByClassName('row col-lg-12')[2].getElementsByClassName('col-lg-6')[1].getElementsByTagName('div')[0].innerText;
    let sem="";
    for(let i=0;i<str.length;i++){
        if((str[i]>='0'&&str[i]<='9')||str[i]==='/') sem+=str[i];
    }
    sem=sem.slice(0,4) +'-'+sem.slice(4);
    return {dp:dp,name:name,roll_no:roll_no,programme:programme,dept:dept,appliedCredits:appliedCredits,sem:sem};

}    

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if(request.action==='getPersonalData'){
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');
        const header=doc.getElementById('headerText');
        if(header!==null&&header.innerText===' Student Pre-Registration Application'){
            sendResponse(getPersonalData());
          }
    }
    if (request.action === 'GetTT') {
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');
      let timetable = {}
      if(!CheckSite(doc)){
        sendResponse({ timetable })
        return
      }
      const content = doc.getElementsByClassName("fc-event-container")
      let d = -1;
      for(let i=0; i<content.length; i++){
        const x = content[i].getElementsByClassName("fc-content")
        if(!(x.length)){
            d++;
        }
        for(let j=0; j<x.length; j++){
            const time1 = x[j].getElementsByClassName("fc-time")
            const title1 = x[j].getElementsByClassName("fc-title")
            let time = null;
            let title = null;
            Array.from(time1).forEach((element) => {
                time = element.getAttribute("data-full")
                for(let k=0; k<time.length; k++){
                    if(time[k] === '-'){
                        time = time.slice(0,k-1)
                    }
                }
              });
            Array.from(title1).forEach((element) => {
                title = element.innerText
              });
            let day = Day(d);
            if (!timetable.hasOwnProperty(day)) {
                timetable[day] = [];
            }
            timetable[day].push({ time: time, title: title })
        }
      }
      sendResponse({ timetable });
    }
 });


function CheckSite(doc){
    const header = doc.getElementById('headerText')
    if(header === null){
        InvalidSite()
        return false
    }
    if(header.innerText !== ' Student Pre-Registration Application'){
        InvalidSite()
        return false
    }
    alert('Yout Time Table has been Successfly Updated. Now, Everytime Chrome will Notify you about your upcoming class in 15 min advance.')
    return true
}


function InvalidSite(){
    alert('Cannot Update your Time Table. Please Login into your Pingala Portal and go to to Student Pre-Registration Application Page.')
}


function Day(d){
    if(d == 0){
        return "Monday"
    }
    if(d == 1){
        return "Tuesday"
    }
    if(d == 2){
        return "Wednesday"
    }
    if(d == 3){
        return "Thursday"
    }
    if(d == 4){
        return "Friday"
    }
}