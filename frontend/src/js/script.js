function extractData(inputText) {
  const timePattern = /\b\d{2}:\d{2}-\d{2}:\d{2}\b/g;
  const codePattern = /\b[A-Z]{4}\d{3}\b/g;
  const titlePattern =
    /\b(?:\d{2}:\d{2}-\d{2}:\d{2}\s+)(.*?)(?=\s+[A-Z]+\d{3}\b)/g;
  const locationPattern =
    /([A-Z]+\d+)\s+(.*?)\s+(?=\d{2}:\d{2}-\d{2}:\d{2}|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|$)/g;
  const datePattern =
    /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gm;

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
  const codes = inputText.match(codePattern) || [];
  const locations = extractlocationsFromTextBlocks(inputText);
  console.log(locations);

  const data = [];

  for (
    let i = 0;
    i <
    Math.max(times.length, typeAndTitles.length, codes.length, locations.length);
    i++
  ) {
    const start_time = times[i] ? times[i].split("-")[0] : "";
    const end_time = times[i] ? times[i].split("-")[1] : "";
    const type = typeAndTitles[i] ? typeAndTitles[i].split("-")[0].trim() : "";
    const title = typeAndTitles[i]
      ? typeAndTitles[i].split(" - ")[1].trim()
      : "";
    const code = codes[i] || "";
    const location = locations[i] || "";

    // mean the index of the whole item in the inputText. time, type, title, code, location
    const wholeItem = `${start_time}-${end_time} ${type} - ${title}`;
    const itemIndex = inputText.indexOf(wholeItem);
    // console.log(wholeItem);
    console.log(itemIndex);

    let currIndex = itemIndex;

    // filter all date indexes to be below the current index and then get the max index
    const indexes = dates
      .filter((dateObj) => dateObj.index < currIndex)
      .map((dateObj) => dateObj.index);
    if (indexes.length > 0) {
      currIndex = Math.max(...indexes);
    }

    // date = the date that has index as currIndex;
    const date = dates.find((dateObj) => dateObj.index === currIndex)?.date;

    data.push({ date, start_time, end_time, type, title, code, location });

    //corrupt the wholeItem to avoid duplicate
    inputText = inputText.replace(wholeItem, "");

    // adjust the indexes of the dates array
    dates.forEach((dateObj) => {
      if (dateObj.index > currIndex) {
        dateObj.index -= wholeItem.length;
      }
    });
  }

  // remove any items that have empty date
  return data.filter((item) => item.date);
}

// function to convert "5 March 2024" to 05/03/2024
function convertDate(date) {
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  const [day, month, year] = date.split(" ");
  return `${day.padStart(2, "0")}/${months[month]}/${year}`;
}

function extractTitleFromTextBlocks(inputText) {
  const titlePattern =
    /\d{2}:\d{2}-\d{2}:\d{2}\s+(.*?)\s+(?=\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)|[A-Z]{4}\d{3}\b)/g;
  const titles = [];
  let match;
  while ((match = titlePattern.exec(inputText)) !== null) {
    titles.push(match[1]);
  }
  return titles;
}

function extractlocationsFromTextBlocks(inputText, index) {
  const locationPattern =
    /[A-Z]+\d+\s+(.*?)\s+(?=\d{2}:\d{2}-\d{2}:\d{2}|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|$)/g;
  const locations = [];
  let match;
  while ((match = locationPattern.exec(inputText.substring(index))) !== null) {
    locations.push(match[1]);
  }

  // Handle the last item separately
  const lastlocationIndex = locations.length - 1; // Adjusted to get the correct index
  if (lastlocationIndex >= 0) {
    const lastlocationMatch = inputText.match(/\b([A-Z]+\d+)\b/g);
    if (lastlocationMatch && lastlocationMatch.length > lastlocationIndex) {
      locations[lastlocationIndex] = lastlocationMatch[lastlocationIndex];
    }
  }

  return locations;
}

function trimTimetableText(text) { }

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}



async function upload() {
  // get text from #input-texxt
  const data = document.getElementById("input-text").value;

  // show a really cool loading animation scanning over the text for 2seconds
  // document.querySelector(".loading").style.display = "flex";
  // await delay(500);
  // document.querySelector(".loading").style.display = "none";

  // call extractData function
  const result = extractData(data);
  userCalendar = result;
  console.log(result);
  downloadICS(result);
  // make a table of result
  // const table = document.querySelector(".table");
  // table.innerHTML = "";
  // const thead = document.createElement("thead");
  // const tbody = document.createElement("tbody");
  // const tr = document.createElement("tr");
  // const headers = [
  //   "date",
  //   "start_time",
  //   "end_time",
  //   "type",
  //   "title",
  //   "code",
  //   "location",
  // ];
  // headers.forEach((header) => {
  //   const th = document.createElement("th");
  //   th.textContent = header;
  //   tr.appendChild(th);
  // });
  // thead.appendChild(tr);
  // table.appendChild(thead);
  // result.forEach((item) => {
  //   const tr = document.createElement("tr");
  //   for (const key in item) {
  //     const td = document.createElement("td");
  //     td.textContent = item[key];
  //     tr.appendChild(td);
  //   }
  //   tbody.appendChild(tr);
  // });
  // table.appendChild(tbody);

  // // download the json
  // const downloadButton = document.createElement("a");
  // downloadButton.href = `data:text/json;charset=utf-8,${encodeURIComponent(
  //   JSON.stringify(result, null, 2)
  // )}`;
  // downloadButton.download = "timetable.json";
  // // click the download button
  // downloadButton.click();
  // // remove the download button
  // downloadButton.remove();

  // show show table button
  // document.getElementById("show-table").style.display = "block";

  // upload events to supabase
  const user = await supabase.auth.getUser();
  const user_id = user.data.user.id;
  const username = document.querySelector("#user_name_here").textContent;

  const { data2, error } = await supabase.from("events").insert(
    result.map((item) => ({ ...item, user_id, username}))
  );
  if (error) {
    console.log(error);
    return;
  }

  location.reload();

}

function downloadICS(events) {
  // Helper function to format date and time for iCal
  function formatDateTime(date, time) {
    date = formatDate(date)
    const dt = new Date(`${date}T${time}`);
    return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Helper function to format date for iCal
  function formatDate(date) {
    // take dd/mm/yyyy 
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  }

  // Create the iCal header
  let ical = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n";

  // Iterate over events and create iCal entries
  events.forEach(event => {
    ical += "BEGIN:VEVENT\n";
    ical += `SUMMARY:${event.title}\n`;
    ical += `LOCATION:${event.location}\n`;
    ical += `DTSTART:${formatDateTime(event.date, event.start_time)}\n`;
    ical += `DTEND:${formatDateTime(event.date, event.end_time)}\n`;
    ical += "END:VEVENT\n";
  });

  // Create the iCal footer
  ical += "END:VCALENDAR";

  // Create a blob from the iCal string
  const blob = new Blob([ical], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  // Create a link element and trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'events.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

let currentKey = "";
text.split("\n").forEach((line) => {
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