/**
 * This function performs a series of search queries on a data table and collects the relevant course information.
 * 
 * 1. It accepts two parameters: `queries` (array of search queries) and `delay` (time delay between searches).
 * 2. The function retrieves the input field for searching in the data table.
 * 3. For each query in the `queries` array:
 *    - Sets the query in the search input and triggers input events to filter the data in the table.
 *    - Waits for the table to update using a delay.
 * 4. After each search update:
 *    - Extracts the relevant course information from each row in the table (course code, course name, instructor, time, location).
 *    - Stores this data in the `LHC` object using the course code as the key.
 * 5. The function processes all queries sequentially and returns an object (`LHC`) that contains the course details for each course found.
 * 6. The structure of `LHC` is: { courseCode: { courseName, instructor, time, location } }.
 */


/**
 * Fetches personal data from the webpage including profile image, name, roll number, program, department, applied credits, and semester.
 * @returns {Object} Object containing personal details.
 */
function getPersonalData() {
    const dp = document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    const name = document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();
    const str = document.getElementsByClassName('content-header')[0]
        .getElementsByClassName('breadcrumb')[0]
        .getElementsByTagName('li')[1].innerText;
    
    let roll_no, programme, dept, appliedCredits;
    const d = document.getElementsByClassName('col-lg-6');
    
    for (let i = 1; i < d.length; i++) {
        const label = d[i].getElementsByTagName('div')[0].previousElementSibling.innerText;
        const value = d[i].getElementsByTagName('div')[0].innerText;
        if (label === "Applied Credits :") appliedCredits = value;
        else if (label === "Roll No. :") roll_no = value;
        else if (label === "Programme :") programme = value;
        else if (label === "Department :") dept = value;
    }

    // Extract semester information
    let sem = "";
    for (let i = 0; i < str.length; i++) {
        if ((str[i] >= '0' && str[i] <= '9') || str[i] === '/') sem += str[i];
    }
    sem = sem.slice(0, 4) + '-' + sem.slice(4);

    return { dp, name, roll_no, programme, dept, appliedCredits, sem };
}

/**
 * Retrieves personal data using a different structure.
 * @returns {Object} Object containing personal details.
 */
function getPersonalData1() {
    const dp = document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    const name = document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();

    const x = document.getElementById("formcontent").getElementsByClassName("col-sm-4 col-lg-8 col-xs-4 col-md-4");
    const roll_no = x[0].innerText;
    const programme = x[2].innerText;
    const dept = x[3].innerText;
    const appliedCredits = x[4].innerText;
    const sem = x[7].innerText;

    return { dp, name, roll_no, programme, dept, appliedCredits, sem };
}

/**
 * Listener for messages from other parts of the extension, processes timetable and personal data requests.
 * @param {Object} request - The message object received.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Function to send a response.
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.action === 'GetTT') {
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');

        let timetable = {};
        let personal_data = {};

        if (!CheckSite(doc)) {
            sendResponse({ timetable, personal_data });
            return;
        }

        personal_data = getPersonalData();
        const content = doc.getElementsByClassName("fc-event-container");
        let d = -1;

        // Parse timetable events
        for (let i = 0; i < content.length; i++) {
            const x = content[i].getElementsByClassName("fc-content");
            if (!x.length) d++;

            for (let j = 0; j < x.length; j++) {
                const time1 = x[j].getElementsByClassName("fc-time");
                const title1 = x[j].getElementsByClassName("fc-title");

                let time, time_start, time_end, title;
                Array.from(time1).forEach((element) => {
                    time = element.getAttribute("data-full");
                    for (let k = 0; k < time.length; k++) {
                        if (time[k] === '-') {
                            time_start = time.slice(0, k - 1);
                            time_end = time.slice(k + 2);
                        }
                    }
                });

                Array.from(title1).forEach((element) => {
                    title = element.innerText;
                });

                const day = Day(d);
                if (!timetable.hasOwnProperty(day)) {
                    timetable[day] = [];
                }
                timetable[day].push({ time: time_start, time_end, title, lectureHall: '' });
            }
        }

        sendResponse({ timetable, personal_data });
    }

    if (request.action === 'FormTT') {
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');
        
        const timetable = {};
        let personal_data = {};

        if (!CheckSite(doc)) {
            sendResponse({ timetable, personal_data });
            return;
        }

        personal_data = getPersonalData1();
        const datatable1 = doc.getElementById("datatable1");

        if (datatable1) {
            const content = datatable1.getElementsByTagName("tbody");
            const rows = content[0].getElementsByTagName("tr");

            for (let j = 0; j < rows.length; j++) {
                const x = rows[j].getElementsByTagName("td");
                let lectureData = [];
                let tutorialData = [];
                let practicalData = [];
                const inputString = x[8].textContent;
                const parts = inputString.split(',');

                // Parse each lecture, tutorial, and practical session
                for (const part of parts) {
                    if (part.includes('Lec')) {
                        const data = parseTimeAndDays(part);
                        if (data) lectureData.push(data);
                    } else if (part.includes('Tut')) {
                        const data = parseTimeAndDays(part);
                        if (data) tutorialData.push(data);
                    } else if (part.includes('Prc')) {
                        const data = parseTimeAndDays(part);
                        if (data) practicalData.push(data);
                    }
                }

                // Populate timetable with parsed data
                if (lectureData.length > 0) {
                    for (const day of lectureData[0].days) {
                        timetable[Day[day]].push({
                            time: lectureData[0].start,
                            time_end: lectureData[0].end,
                            title: "Lec-" + x[1].textContent,
                            lectureHall: lectureData[0].value
                        });
                    }
                }

                if (tutorialData.length > 0) {
                    for (const day of tutorialData[0].days) {
                        timetable[Day[day]].push({
                            time: tutorialData[0].start,
                            time_end: tutorialData[0].end,
                            title: "Tut-" + x[1].textContent,
                            lectureHall: tutorialData[0].value
                        });
                    }
                }

                if (practicalData.length > 0) {
                    for (const day of practicalData[0].days) {
                        timetable[Day[day]].push({
                            time: practicalData[0].start,
                            time_end: practicalData[0].end,
                            title: "Prac-" + x[1].textContent,
                            lectureHall: practicalData[0].value
                        });
                    }
                }
            }
        }

        sendResponse({ timetable, personal_data });
    }

    if (request.action === 'LHC') {
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');

        chrome.runtime.sendMessage({ action: 'alert', alert_type: CheckSite_1(doc) });

        if (CheckSite_1(doc) !== '3') return;

        let data;
        try {
            data = await search(request.courses, 10);
            console.log(data);
            chrome.runtime.sendMessage({ action: 'LHCData', data });
        } catch (error) {
            console.error(error);
        }
    }
});

/**
 * Searches the table for the provided courses.
 * @param {Array} queries - Array of course queries to search.
 * @param {number} delay - Delay between each search.
 * @returns {Object} Object with course results.
 */
async function search(queries, delay) {
    let LHC = {}; // Object to store course search results
    const parent = document.getElementById('datatable_filter');
    const input = parent.querySelector('.form-control');

    // Loop through the queries and perform the search
    for (const query of queries) {
        console.log(query);

        input.value = '(' + query + ')';
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);


        await new Promise(resolve => setTimeout(resolve, delay));

        const table = document.getElementById('datatable');
        const tbody = table.tBodies[0];
        const rows = tbody.getElementsByTagName('tr');

        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            const courseCode = cells[0] ? cells[0].innerText.trim() : '';
            const courseName = cells[1] ? cells[1].innerText.trim() : '';
            const instructor = cells[2] ? cells[2].innerText.trim() : '';
            const time = cells[3] ? cells[3].innerText.trim() : '';
            const location = cells[4] ? cells[4].innerText.trim() : '';

            if (courseCode && courseName) {
                LHC[courseCode] = {
                    courseName,
                    instructor,
                    time,
                    location
                };
            }
        }
    }

    // Return the processed LHC data
    return LHC;
}



    /**
 * Retrieves personal data from the page.
 * @returns {Object} - An object containing the user's personal data (profile picture, name, roll number, programme, department, applied credits, and semester).
 */
function getPersonalData() {
    const dp = document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    const name = document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();
    const str = document.getElementsByClassName('content-header')[0]
        .getElementsByClassName('breadcrumb')[0]
        .getElementsByTagName('li')[1].innerText;

    let roll_no, programme, dept, appliedCredits;
    const d = document.getElementsByClassName('col-lg-6');
    
    // Loop through the sections to fetch roll number, programme, department, and applied credits
    for (let i = 1; i < d.length; i++) {
        const label = d[i].getElementsByTagName('div')[0].previousElementSibling.innerText;
        const value = d[i].getElementsByTagName('div')[0].innerText;
        
        if (label === "Applied Credits :") {
            appliedCredits = value;
        } else if (label === "Roll No. :") {
            roll_no = value;
        } else if (label === "Programme :") {
            programme = value;
        } else if (label === "Department :") {
            dept = value;
        }
    }

    // Extract the semester information
    let sem = "";
    for (let i = 0; i < str.length; i++) {
        if ((str[i] >= '0' && str[i] <= '9') || str[i] === '/') {
            sem += str[i];
        }
    }
    sem = sem.slice(0, 4) + '-' + sem.slice(4);
    
    return { dp, name, roll_no, programme, dept, appliedCredits, sem };
}

/**
 * Retrieves personal data from a different page structure.
 * @returns {Object} - An object containing the user's personal data (profile picture, name, roll number, programme, department, applied credits, and semester).
 */
function getPersonalData1() {
    const dp = document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    const name = document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();
    
    const x = document.getElementById("formcontent").getElementsByClassName("col-sm-4 col-lg-8 col-xs-4 col-md-4");
    const roll_no = x[0].innerText;
    const programme = x[2].innerText;
    const dept = x[3].innerText;
    const appliedCredits = x[4].innerText;
    const sem = x[7].innerText;
    
    return { dp, name, roll_no, programme, dept, appliedCredits, sem };
}

/**
 * Chrome runtime listener that handles different messages from the extension.
 */
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === 'GetTT') {
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');
        
        let timetable = {};
        let personal_data = {};
        
        if (!CheckSite(doc)) {
            sendResponse({ timetable, personal_data });
            return;
        }

        personal_data = getPersonalData();
        const content = doc.getElementsByClassName("fc-event-container");
        let d = -1;

        // Loop through the timetable events and extract relevant data
        for (let i = 0; i < content.length; i++) {
            const x = content[i].getElementsByClassName("fc-content");
            if (!(x.length)) {
                d++;
            }
            for (let j = 0; j < x.length; j++) {
                const time1 = x[j].getElementsByClassName("fc-time");
                const title1 = x[j].getElementsByClassName("fc-title");
                
                let time = null, time_start = null, time_end = null, title = null;
                Array.from(time1).forEach((element) => {
                    time = element.getAttribute("data-full");
                });

                Array.from(title1).forEach((element) => {
                    title = element.innerText;
                });

                if (time) {
                    const [start, end] = time.split(" - ");
                    time_start = start.trim();
                    time_end = end.trim();
                }

                if (title && time_start && time_end) {
                    d++;
                    let day = x[j].getElementsByClassName("fc-day-header")[0].innerText;
                    if (day) {
                        let dayName = day.split(",")[0].trim();
                        let key = `${dayName}`;
                        if (!timetable[key]) {
                            timetable[key] = [];
                        }
                        timetable[key].push({
                            time_start: time_start,
                            time_end: time_end,
                            subject: title
                        });
                    }
                }
            }
        }
        
        sendResponse({ timetable, personal_data });
    }
});

/**
 * Checks if the current site is the timetable page.
 * @param {Document} doc - The document object of the current page.
 * @returns {boolean} - True if the page is the expected timetable page, otherwise false.
 */
function CheckSite(doc) {
    const title = doc.getElementsByTagName("title")[0].innerText;
    return title && title.includes("Timetable");
}
