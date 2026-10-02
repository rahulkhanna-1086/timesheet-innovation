# Weekflow — Timesheet Planner

## App description

**Weekflow is a lightweight, standalone weekly timesheet planner for people who want to mark work days and enter planned hours quickly.** Its week-at-a-glance view replaces repetitive day-by-day selection with one-click day cards and useful bulk actions. Weekflow is an independent planning demo: it does not connect to, copy data from, or submit information to Zensar or any other timesheet service.

### Short description

> Plan a work week in a few clicks. Select days, adjust hours, and see your weekly total at a glance—with your plan saved in your browser.

## What it does

- Shows a Monday-to-Sunday week with a clear visual state for planned and unplanned days.
- Lets you select or deselect an individual day with its day card.
- Adds Monday through Friday with **Weekdays**, or removes all selections with **Clear week**.
- Allows inline daily hour entry in quarter-hour increments, from 0 to 24.
- Calculates the selected-day count and planned-hour total immediately.
- Navigates between weeks and provides a **Today** shortcut.
- Saves each week in the current browser using local storage, so a refresh does not discard the plan.
- Supports keyboard operation: Tab to reach controls, Enter or Space to toggle a day, and the left/right arrows to move between day cards.
- Adapts its layout for desktop and mobile screens.

## How to use

1. Start the app using the instructions below and open it in a browser.
2. Select the days you intend to plan, or use **Weekdays** to select the standard work week.
3. Adjust the hours on each selected day. The total updates as you edit.
4. Use the week arrows to plan a different week. Use **Clear week** to remove that week's day selections.

Unselected days are not included in the hour total. Clearing a week removes its day selections but keeps the hours entered for those days in case you select them again.

## Run locally

Requires Node.js 18 or newer. No package installation is needed.

```sh
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). To use port 8888 in PowerShell:

```powershell
$env:PORT=8888; npm run dev
```

Then open [http://localhost:8888](http://localhost:8888). The server defaults to port 4173 when `PORT` is not set.

## Publish as a website

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`. When GitHub Pages is enabled, it builds and publishes the static app on each push to `main`. You can also run it manually from the repository's **Actions** tab with **Deploy Weekflow to GitHub Pages**.

For this repository, the expected site address is [https://rahulkhanna-1086.github.io/timesheet-innovation/](https://rahulkhanna-1086.github.io/timesheet-innovation/). The repository is private, and GitHub reports that its current plan does not support Pages for this repository, so the site cannot be published there yet. Publishing it with Pages requires changing to a GitHub plan that supports Pages for a private repository, or making the repository public (which exposes all repository contents). The workflow does not change repository visibility. Once Pages is available, the first successful deployment publishes the live address in its workflow summary.

## Run tests

```sh
npm test
```

The Node built-in test suite checks week calculation and navigation, weekday selection, individual toggling, clearing, hour validation, and totals.

## Privacy and scope

Weekflow has no account system, server-side database, or timesheet submission integration. Planner data stays in the browser's local storage on the device where it was entered; it is not synchronized between browsers or devices. The local-development site and published website have separate browser storage. Clearing browser storage removes saved plans. This MVP is for planning only and is not an official work-hours record or submission tool.

## Implementation

The app uses native HTML, CSS, and JavaScript modules, with a small Node.js static-file server and no runtime package dependencies. Google Fonts are an optional network-loaded enhancement; system fonts are used if they are unavailable.
