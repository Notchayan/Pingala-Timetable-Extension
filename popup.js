document.getElementById('updateBtn').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: 'GetTT', tabId: tab.id });
  //document.getElementById('timetableBtn').classList.remove('hide');
  window.alert('Yout Time Table has been Successfly Updated. Now, Everytime Chrome will Notify you about your upcoming class in 15 min advance.')
});
















document.getElementById('upcomingClass').addEventListener('click',async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.runtime.sendMessage({ action: 'upcomingClass', tabId: tab.id });
});


document
  .getElementById("timetableBtn")
  .addEventListener("click", async function () {
    document.getElementById("upcomingClass").style.display = "none";
    document.getElementById("timetableBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("LHC").style.display = "none";
    document.getElementsByClassName("personal")[0].style.display = "none";
    const ContainerElement = document.getElementsByClassName("container")[0];
    let closeButton = document.createElement("button");
    ContainerElement.style.width = "760px";
    closeButton.innerHTML = "Back";
    closeButton.id = "closeButton";
    document.getElementById("closeBtn").appendChild(closeButton);
    // document.getElementById("closeButton").style="color:#001c30";

    document.getElementById("closeButton").addEventListener("click", () => {
      const ContainerElement = document.getElementsByClassName("container")[0];
      ContainerElement.style.width = "320px";
      document.getElementById("closeBtn").innerHTML = "";
      document.getElementById("timetableBtns").innerHTML = "";
      document.getElementById("timetableGrid").innerHTML = "";
      document.getElementById("upcomingClass").style.display = "";
      document.getElementById("timetableBtn").style.display = "";
      document.getElementById("updateBtn").style.display = "";
      document.getElementById("LHC").style.display = "";
      document.getElementsByClassName("personal")[0].style.display = "";
      timetableGrid.style.opacity = '0';
    }); 
    addTT();
    LabClashes();
    timetableGrid.style.opacity = '1';

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete Class";
    deleteButton.id = "deleteButton";
    document.getElementById("timetableBtns").appendChild(deleteButton);
    document.getElementById('deleteButton').style="color:black";
  
    let deleteButtonClicked = false;

    let deleteBtn = document.getElementById("deleteButton");

    deleteBtn.addEventListener("click", () => {
      if (deleteButtonClicked) {
        deleteButtonClicked = false;
        deleteBtn.innerHTML = "Delete Class";
        deleteBtn.style.backgroundColor = "#64ccc5";
        deleteBtn.style.color = "black";
        deleteBtn.style.border = "none";
        let minusSigns = document.getElementsByClassName("minus-btn");

        Array.from(minusSigns).forEach((minusSign) => {
          minusSign.style.display = 'none';
        });
      } else {
        deleteButtonClicked = true;
        deleteBtn.innerHTML = "Stop Deleting";
        deleteBtn.style.backgroundColor = "#dafffb";
        deleteBtn.style.color = "#176b87";
        deleteBtn.style.border = "2px solid #176b87";
        let minusSigns = document.getElementsByClassName("minus-btn");

        Array.from(minusSigns).forEach(function (minusSign) {
          minusSign.style.display = 'block';
          minusSign.addEventListener("click", function () {
            const classCell = this.closest(".class-cell");
            const day = classCell.parentElement.querySelector(".day-header").textContent;
            const title = classCell.querySelector(".title").textContent;
            const time = classCell.querySelector(".time").textContent;
            LabClashes();
            classCell.remove();

            chrome.storage.local.get(["timetable"], (data) => {
              let timetable = data.timetable;

              if (timetable.hasOwnProperty(day)) {
                timetable[day] = timetable[day].filter(function (element) {
                  return !(element.time === time && element.title === title);
                });

                chrome.storage.local.set({ timetable: timetable }, function () {
                  console.log("Timetable stored in Chrome Storage:", timetable);
                  console.log("The matching element has been removed");
                });
              }
            });
          });
        });
      }
    });

    let subjects = [];

    chrome.storage.local.get(["timetable"], (data) => {
      let timetable = data.timetable;

      for (let day in timetable) {
        let dayArray = timetable[day];

        for (let i = 0; i < dayArray.length; i++) {
          let subject = dayArray[i].title;

          if (!subjects.includes(subject)) {
            subjects.push(subject);
          }
        }
      }
      subjects.forEach((subject) => {
        let subjectBtn = subject + "Btn" + " add-btn";

        Array.from(document.getElementsByClassName(subjectBtn)).forEach(
          (button) => {
            button.addEventListener("click", () => {
              let parent = button.parentNode;
              let inputField = parent.querySelector("." + subject + "Inp");
              let lectureHall = inputField.value;
              chrome.storage.local.get(["timetable"], (data) => {
                let timetable = data.timetable;

                for (let day in timetable) {
                  timetable[day].forEach((element) => {
                    if (element.title === subject) {
                      element.lectureHall = lectureHall;
                    }
                  });
                }
                chrome.storage.local.set({ timetable: timetable }, function () {
                  console.log(
                    "Updated timetable has been stored in Chrome local storage:", timetable
                  );
                  Array.from(document.getElementsByClassName(subjectBtn)).forEach(
                    (elem) => {
                      elem.style.visibility = "hidden";
                    }
                  )
                  Array.from(document.getElementsByClassName(subject+"Inp")).forEach(
                    (elem) => {
                      elem.style.visibility = "hidden";
                    }
                  )
                  Array.from(document.getElementsByClassName(subject + " txt-btn")).forEach(
                    (element) => {
                      element.innerHTML = lectureHall;
                      element.style.visibility = "visible";
                    }
                  );
                });
              });
            });
          }
        );
      });
    });
    LHC();
  });


function addTT() {
  chrome.storage.local.get(["timetable"], function (result) {
    let storedData = result.timetable;
    let gridHTML = '<div class="timetable-grid-container">';
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach((day) => {
      const dataArray = storedData[day];
      gridHTML += `<div class="timetable-day">
                      <div class="day-header">${day}</div>`;
      dataArray.forEach((data) => {
        const time = data.time;
        const title = data.title;
        const classCell = `<div class="class-cell">
                           <div class="minus-btn-container">
                           <button class="minus-btn">-</button>
                           </div>
                           <div class="time">${time}</div>
                           <div class="title">${title}</div>
                           <div class="${title} txt-btn"></div>
                           <div class="add-btn-container">
                           <input type="text" class="${title}Inp" placeholder="Add LHC">
                           <button class="${title}Btn add-btn">+</button>
                           </div>
                          </div>`;
        gridHTML += classCell;
      });
      gridHTML += `</div>`;
    });
    gridHTML += "</div>";
    document.getElementById("timetableGrid").innerHTML = gridHTML;
  });
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
