chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
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
            let time = null
            let time_start = null;
            let time_end = null;
            let title = null;
            Array.from(time1).forEach((element) => {
                time = element.getAttribute("data-full")
                for(let k=0; k<time.length; k++){
                    if(time[k] === '-'){
                        time_start = time.slice(0,k-1)
                        time_end = time.slice(k+2)
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
            timetable[day].push({ time: time_start, time_end: time_end, title: title , lectureHall : '' })
        }
      }
      sendResponse({timetable});
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