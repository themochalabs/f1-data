# F1 Data

This repository automatically pulls Formula 1 schedule data from the OpenF1 API and converts it into a simple JSON format used by my F1 dashboard.

## How It Works

The updater reads data from:

- OpenF1 Meetings API
- OpenF1 Sessions API

It combines race meetings and sessions using the OpenF1 `meeting_key`.

The generated JSON includes:

- Race name
- Location
- Round number
- Slug
- Practice sessions
- Sprint sessions
- Qualifying
- Grand Prix start time

## Repository Structure

```text
f1-data/
│
├── data/
│   └── 2026.json
│
├── scripts/
│   └── update-f1.js
│
└── .github/
    └── workflows/
        └── update-f1.yml
```

## Automatic Updates

GitHub Actions runs the updater once per day.

The workflow:

1. Checks the current year
2. Requests that season from OpenF1
3. Converts the OpenF1 data
4. Creates or updates the corresponding JSON file
5. Commits any changes back to the repository

## Data Format

Example:

```json
{
  "races": [
    {
      "name": "Australian",
      "location": "Melbourne",
      "latitude": null,
      "longitude": null,
      "round": 1,
      "slug": "australian-grand-prix",
      "localeKey": "australian-grand-prix",
      "sessions": {
        "fp1": "2026-03-06T01:30:00Z",
        "fp2": "2026-03-06T05:00:00Z",
        "fp3": "2026-03-07T01:30:00Z",
        "qualifying": "2026-03-07T05:00:00Z",
        "gp": "2026-03-08T04:00:00Z"
      }
    }
  ]
}
```

## Data Source

Schedule data is provided by OpenF1.

This repository is not affiliated with Formula 1.
