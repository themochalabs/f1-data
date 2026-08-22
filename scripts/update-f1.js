const fs = require("fs");
const path = require("path");


// Current year automatically
const YEAR = new Date().getUTCFullYear();


// OpenF1 endpoints
const MEETINGS_URL =
  `https://api.openf1.org/v1/meetings?year=${YEAR}`;

const SESSIONS_URL =
  `https://api.openf1.org/v1/sessions?year=${YEAR}`;


// Output file
const OUTPUT_FILE = path.join(
  __dirname,
  "..",
  "data",
  `${YEAR}.json`
);


// Convert OpenF1 session names to your site's names
const SESSION_MAP = {
  "Practice 1": "fp1",
  "Practice 2": "fp2",
  "Practice 3": "fp3",
  "Sprint Qualifying": "sprintQualifying",
  "Sprint Shootout": "sprintQualifying",
  "Sprint": "sprint",
  "Qualifying": "qualifying",
  "Race": "gp"
};


async function getJson(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `OpenF1 request failed: ${response.status}`
    );
  }

  return response.json();
}


function formatDate(date) {

  return new Date(date)
    .toISOString()
    .replace(".000Z", "Z");
}


function makeName(meetingName) {

  return meetingName
    .replace(/\s+Grand Prix$/i, "")
    .trim();
}


function makeSlug(name) {

  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-grand-prix";
}


async function updateF1() {

  const [meetings, sessions] =
    await Promise.all([
      getJson(MEETINGS_URL),
      getJson(SESSIONS_URL)
    ]);


  // Only active Grand Prix meetings for current year
  const racesForYear = meetings

    .filter(meeting =>

      Number(meeting.year) === YEAR &&

      meeting.is_cancelled !== true &&

      meeting.meeting_name
        .toLowerCase()
        .includes("grand prix")

    )

    .sort(
      (a, b) =>
        new Date(a.date_start) -
        new Date(b.date_start)
    );


  const races = racesForYear.map(
    (meeting, index) => {

      const name =
        makeName(meeting.meeting_name);

      const slug =
        makeSlug(name);


      // Find all sessions belonging to this race
      const raceSessions = sessions

        .filter(session =>

          Number(session.year) === YEAR &&

          session.meeting_key ===
            meeting.meeting_key &&

          session.is_cancelled !== true

        )

        .sort(
          (a, b) =>
            new Date(a.date_start) -
            new Date(b.date_start)
        );


      const convertedSessions = {};


      for (const session of raceSessions) {

        const key =
          SESSION_MAP[session.session_name];

        if (!key) {
          continue;
        }

        convertedSessions[key] =
          formatDate(session.date_start);
      }


      return {

        name: name,

        location:
          meeting.location,

        latitude: null,

        longitude: null,

        round:
          index + 1,

        slug: slug,

        localeKey: slug,

        sessions:
          convertedSessions

      };

    }
  );


  const output = {
    races: races
  };


  // Create /data folder if needed
  fs.mkdirSync(
    path.dirname(OUTPUT_FILE),
    {
      recursive: true
    }
  );


  // Create/update YEAR.json
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      output,
      null,
      2
    ) + "\n",
    "utf8"
  );


  console.log(
    `${YEAR}.json created successfully`
  );

}


updateF1().catch(error => {

  console.error(error);

  process.exit(1);

});