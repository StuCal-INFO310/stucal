function extractData(inputText) {
    const timePattern = /\b\d{2}:\d{2}-\d{2}:\d{2}\b/g;
    const paperPattern = /\b[A-Z]{4}\d{3}\b/g;
    const titlePattern = /\b(?:\d{2}:\d{2}-\d{2}:\d{2}\s+)(.*?)(?=\s+[A-Z]+\d{3}\b)/g;
    const roomPattern = /([A-Z]+\d+)\s+(.*?)\s+(?=\d{2}:\d{2}-\d{2}:\d{2}|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|$)/g;
    const datePattern = /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gm;

    const dates = [];
    let match;
    while ((match = datePattern.exec(inputText)) !== null) {
        // find that date in the inputText and get the index
        const index = inputText.indexOf(match[1]);
        // push an object with the date and the index to the dates array
        dates.push({ date: convertDate(match[1]), index });



    }
    console.log(dates);

    const times = inputText.match(timePattern) || [];
    const typeAndTitles = extractTitleFromTextBlocks(inputText);
    const papers = inputText.match(paperPattern) || [];
    const rooms = extractRoomsFromTextBlocks(inputText);
    console.log(rooms);

    const data = [];

    for (let i = 0; i < Math.max(times.length, typeAndTitles.length, papers.length, rooms.length); i++) {
        const start_time = times[i] ? times[i].split("-")[0] : '';
        const end_time = times[i] ? times[i].split("-")[1] : '';
        const type = typeAndTitles[i] ? typeAndTitles[i].split("-")[0].trim() : '';
        const title = typeAndTitles[i] ? typeAndTitles[i].split(" - ")[1].trim() : '';
        const paper = papers[i] || '';
        const room = rooms[i] || '';

        // mean the index of the whole item in the inputText. time, type, title, paper, room
        const wholeItem = `${start_time}-${end_time} ${type} - ${title}`;
        const itemIndex = inputText.indexOf(wholeItem);
        // console.log(wholeItem);
        console.log(itemIndex);


        let currIndex = itemIndex;

        // filter all date indexes to be below the current index and then get the max index
        const indexes = dates.filter(dateObj => dateObj.index < currIndex).map(dateObj => dateObj.index);
        if (indexes.length > 0) {
            currIndex = Math.max(...indexes);
        }




        // date = the date that has index as currIndex;
        const date = dates.find(dateObj => dateObj.index === currIndex)?.date;

        data.push({ date, start_time, end_time, type, title, paper, room });

        //corrupt the wholeItem to avoid duplicate
        inputText = inputText.replace(wholeItem, '');

        // adjust the indexes of the dates array
        dates.forEach(dateObj => {
            if (dateObj.index > currIndex) {
                dateObj.index -= wholeItem.length;
            }
        });


    }

    // remove any items that have empty date
    return data.filter(item => item.date);

}



// function to convert "5 March 2024" to 05/03/2024
function convertDate(date) {
    const months = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12'
    };
    const [day, month, year] = date.split(' ');
    return `${day.padStart(2, '0')}/${months[month]}/${year}`;
}



function extractTitleFromTextBlocks(inputText) {
    const titlePattern = /\d{2}:\d{2}-\d{2}:\d{2}\s+(.*?)\s+(?=\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)|[A-Z]{4}\d{3}\b)/g;
    const titles = [];
    let match;
    while ((match = titlePattern.exec(inputText)) !== null) {
        titles.push(match[1]);
    }
    return titles;
}

function extractRoomsFromTextBlocks(inputText, index) {
    const roomPattern = /[A-Z]+\d+\s+(.*?)\s+(?=\d{2}:\d{2}-\d{2}:\d{2}|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|$)/g;
    const rooms = [];
    let match;
    while ((match = roomPattern.exec(inputText.substring(index))) !== null) {
        rooms.push(match[1]);
    }

    // Handle the last item separately
    const lastRoomIndex = rooms.length - 1; // Adjusted to get the correct index
    if (lastRoomIndex >= 0) {
        const lastRoomMatch = inputText.match(/\b([A-Z]+\d+)\b/g);
        if (lastRoomMatch && lastRoomMatch.length > lastRoomIndex) {
            rooms[lastRoomIndex] = lastRoomMatch[lastRoomIndex];
        }
    }

    return rooms;
}

function trimTimetableText(text) {

}

async function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function upload() {
    // get text from #input-texxt
    const data = document.getElementById('input-text').value;

    // show a really cool loading animation scanning over the text for 2seconds
    document.querySelector('.loading').style.display = 'flex';
    await delay(500);
    document.querySelector('.loading').style.display = 'none';


    // call extractData function
    const result = extractData(data);
    console.log(result);
    // make a table of result
    const table = document.querySelector('.table');
    table.innerHTML = '';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const headers = ['Date', 'Start Time', 'End Time', 'Type', 'Title', 'Paper', 'Room'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    result.forEach(item => {
        const tr = document.createElement('tr');
        for (const key in item) {
            const td = document.createElement('td');
            td.textContent = item[key];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // download the json
    const downloadButton = document.createElement('a');
    downloadButton.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    downloadButton.download = 'timetable.json';
    // click the download button
    downloadButton.click();
    // remove the download button
    downloadButton.remove();

    // show show table button
    document.getElementById('show-table').style.display = 'block';





}


const text = `Tuesday
12 March 2024	09:00-10:00 Tutorial - Financial Decision Making
BSNS114
OBSLG05
11:00-13:00 Computer Lab - Computational Problem Solving
COSC326
OWG06
12:00-14:00 Lecture - Financial Decision Making
BSNS114
AUDIT
14:00-15:00 Lecture - Consumer Behaviour
MART210
CAST1
Wednesday
13 March 2024	09:00-10:00 Tutorial - Consumer Behaviour
MART210
T103
14:00-15:00 Lecture - Consumer Behaviour
MART210
ARCH4
14:00-16:00 Lecture - Software Project Management
INFO310
T204
Thursday
14 March 2024	10:00-11:00 Tutorial - Computational Problem Solving
COSC326
T204
11:00-12:00 Computer Lab - Software Project Management
INFO310
CNCAL
12:00-13:00 Lecture - Financial Decision Making
BSNS114
AUDIT
Friday
15 March 2024	11:00-13:00 Computer Lab - Computational Problem Solving
COSC326
OWG06`;

const events = {};

let currentKey = '';
text.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return;

    if (/^\w+day$/.test(trimmedLine)) {
        currentKey = trimmedLine;
        events[currentKey] = [];
    } else {
        events[currentKey].push(trimmedLine);
    }
});

console.log(events);

function output12MonthTable() {
  const inputText = document.getElementById('input-text').value.trim(); // Get the input text from the textarea
  const lines = inputText.split('\n'); // Split the input text into lines
  
  // Combine consecutive lines that belong to the same event
  const combinedLines = [];
  let combinedLine = '';
  const calendarEvents = {}; // Object to store events for each day

  lines.forEach(line => {
      if (line.match(/^\w+\s+\d+\s+\w+\s+\d+$/)) { // Check if the line matches the date pattern
          if (combinedLine) {
              combinedLines.push(combinedLine.trim());
              combinedLine = '';
          }
      }
      combinedLine += line + '\t'; // Concatenate lines with a tab separator
  });
  if (combinedLine) {
      combinedLines.push(combinedLine.trim());
  }

  console.log(combinedLines); // Check the combined lines


  // Regular expression patterns to match date and event information
  const datePattern = /^\w+\s+(\d+)\s+\w+\s+(\d+)/;
  const eventPattern = /^\w+\s+(\d+)\s+\w+\s+(\d+)\s+(\d+:\d+)-(\d+:\d+)\s+(.+)/;

  // Loop through each line of input
  lines.forEach(line => {
      const dateMatch = line.match(datePattern); // Match date
      const eventMatch = line.match(eventPattern); // Match event

      if (dateMatch && eventMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const startHour = eventMatch[3];
          const startMinute = eventMatch[4];
          const endHour = eventMatch[5];
          const endMinute = eventMatch[6];
          const eventDetails = eventMatch[7];

          // Generate date key in the format "day month 2024"
          const dateKey = `${day} ${months[month - 1]} 2024`;

          // Add event to the calendarEvents object
          if (calendarEvents[dateKey]) {
              calendarEvents[dateKey].push({
                  time: `${startHour}:${startMinute}-${endHour}:${endMinute}`,
                  info: eventDetails // Changed from "event" to "info"
              });
          } else {
              calendarEvents[dateKey] = [{
                  time: `${startHour}:${startMinute}-${endHour}:${endMinute}`,
                  info: eventDetails // Changed from "event" to "info"
              }];
          }
      }
  });

  // Generate the calendar with events
  generateCalendar(calendarEvents);
}




function generateCalendar(calendarEvents) {
  const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
//Add a comparison for day in the text file to match the daysOfWeek
//or comapre the dates with the json file to match teh dates to display in the cell of the table
  let calendarHTML = "";

  for (let month = 0; month < 12; month++) {
      calendarHTML += `<div>`;
      calendarHTML += `<h2 class="month-title">${months[month]}</h2>`;
      calendarHTML += `<table class="calendar"><tr>`;
      daysOfWeek.forEach(day => {
          calendarHTML += `<th>${day}</th>`;
      });
      calendarHTML += `</tr><tr>`;

      let dayCounter = 1;
      const totalDays = daysInMonth[month];
      let firstDayOfMonth = new Date(2024, month, 1).getDay(); // Starting day of the week for the month

      // Initialize an array to store events for each day of the month
      const eventsForMonth = new Array(totalDays).fill(null).map(() => []);

      // Loop through each day in the calendar
      for (let i = 0; i < 6; i++) { // 6 rows for each month
          for (let j = 0; j < 7; j++) { // 7 columns for each week
              if (i === 0 && j < firstDayOfMonth) {
                  calendarHTML += `<td></td>`; // Empty cell before the first day of the month
              } else if (dayCounter <= totalDays) {
                  const currentDate = new Date(2024, month, dayCounter);
                  const events = calendarEvents[currentDate.toDateString()] || [];

                  // Create event list for the current day
                  const eventList = events.map(event => `<li>${event.time} - ${event.info}</li>`).join('');

                  // Insert events into cell
                  calendarHTML += `<td>${dayCounter}`;
                  if (events.length > 0) {
                      calendarHTML += `<ul>${eventList}</ul>`;
                  }
                  calendarHTML += `</td>`;

                  dayCounter++;
              } else {
                  calendarHTML += `<td></td>`; // Empty cell after the last day of the month
              }
          }
          if (dayCounter > totalDays) break; // Exit loop if all days of the month are added
          calendarHTML += `</tr><tr>`;
      }
      calendarHTML += `</tr></table>`;
      calendarHTML += `</div>`;
  }

  document.getElementById('calendar').innerHTML = calendarHTML;
}

