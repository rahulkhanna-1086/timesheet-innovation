import {
  addDays,
  clearWeek,
  createWeek,
  getWeekStart,
  getWeekSummary,
  setDayHours,
  setWeekdays,
  toDateKey,
  toggleDay,
} from "./planner.js";

const STORAGE_KEY = "timesheet-planner:v1";
const todayKey = toDateKey(new Date());
const state = {
  weekStart: getWeekStart(),
  weeks: {},
};

const weekGrid = document.querySelector("#week-grid");
const weekLabel = document.querySelector("#week-label");
const monthLabel = document.querySelector("#month-label");
const summaryDays = document.querySelector("#summary-days");
const summaryHours = document.querySelector("#summary-hours");
const todayButton = document.querySelector("#today-button");
const saveMessage = document.querySelector("#save-message");

function readSavedWeeks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed.weeks === "object" && parsed.weeks !== null
      ? parsed.weeks
      : {};
  } catch {
    saveMessage.textContent = "Saved planner data could not be read. Changes will still work for this visit.";
    return {};
  }
}

state.weeks = readSavedWeeks();

function getCurrentWeek() {
  return state.weeks[state.weekStart] || createWeek(state.weekStart);
}

function saveWeek() {
  state.weeks[state.weekStart] = getCurrentWeek();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weeks: state.weeks }));
    saveMessage.textContent = "Saved on this device";
  } catch {
    saveMessage.textContent = "Could not save on this device";
  }
}

function formatWeekRange(weekStart) {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(`${addDays(weekStart, 6)}T12:00:00`);
  const sameMonth = start.getMonth() === end.getMonth();
  const startFormat = new Intl.DateTimeFormat(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  const endFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${startFormat.format(start)} – ${endFormat.format(end)}`;
}

function formatDay(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
    fullWeekday: new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date),
    day: new Intl.DateTimeFormat(undefined, { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
  };
}

function render() {
  const week = getCurrentWeek();
  const summary = getWeekSummary(week);
  const start = new Date(`${state.weekStart}T12:00:00`);

  weekLabel.textContent = formatWeekRange(state.weekStart);
  monthLabel.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(start);
  summaryDays.textContent = `${summary.dayCount} ${summary.dayCount === 1 ? "day" : "days"}`;
  summaryHours.textContent = `${Number(summary.totalHours.toFixed(2))}h`;
  todayButton.disabled = getWeekStart() === state.weekStart;
  weekGrid.replaceChildren(...week.map(renderDay));
}

function renderDay(day) {
  const date = formatDay(day.date);
  const article = document.createElement("article");
  article.className = `day-card${day.selected ? " is-selected" : ""}${day.date === todayKey ? " is-today" : ""}`;

  const button = document.createElement("button");
  button.className = "day-toggle";
  button.type = "button";
  button.setAttribute("aria-pressed", String(day.selected));
  button.setAttribute(
    "aria-label",
    `${date.fullWeekday}, ${date.month} ${Number(date.day)}: ${day.selected ? "planned" : "not planned"}`,
  );
  button.dataset.date = day.date;

  const top = document.createElement("span");
  top.className = "day-topline";
  const weekday = document.createElement("span");
  weekday.className = "weekday";
  weekday.textContent = date.weekday;
  const marker = document.createElement("span");
  marker.className = "selection-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = day.selected ? "✓" : "+";
  top.append(weekday, marker);

  const number = document.createElement("span");
  number.className = "date-number";
  number.textContent = String(Number(date.day));

  const stateLabel = document.createElement("span");
  stateLabel.className = "day-state";
  stateLabel.textContent = day.selected ? "Planned" : "Add day";
  button.append(top, number, stateLabel);
  article.append(button);

  if (day.selected) {
    const hoursLabel = document.createElement("label");
    hoursLabel.className = "hours-label";
    hoursLabel.textContent = "Hours";
    const hoursRow = document.createElement("span");
    hoursRow.className = "hours-control";
    const hours = document.createElement("input");
    hours.type = "number";
    hours.min = "0";
    hours.max = "24";
    hours.step = "0.25";
    hours.value = String(day.hours);
    hours.setAttribute("aria-label", `Hours for ${date.fullWeekday}`);
    hours.dataset.date = day.date;
    const unit = document.createElement("span");
    unit.textContent = "h";
    unit.setAttribute("aria-hidden", "true");
    hoursRow.append(hours, unit);
    hoursLabel.append(hoursRow);
    article.append(hoursLabel);
  } else {
    const hint = document.createElement("span");
    hint.className = "day-hint";
    hint.textContent = "Tap to add";
    article.append(hint);
  }

  return article;
}

function updateWeek(update) {
  state.weeks[state.weekStart] = update(getCurrentWeek());
  saveWeek();
  render();
}

document.querySelector("#previous-week").addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, -7);
  render();
});

document.querySelector("#next-week").addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, 7);
  render();
});

todayButton.addEventListener("click", () => {
  state.weekStart = getWeekStart();
  render();
});

document.querySelector("#weekdays-button").addEventListener("click", () => {
  updateWeek(setWeekdays);
});

document.querySelector("#clear-button").addEventListener("click", () => {
  updateWeek(clearWeek);
});

weekGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".day-toggle");
  if (!button) return;
  updateWeek((week) => toggleDay(week, button.dataset.date));
});

weekGrid.addEventListener("change", (event) => {
  const input = event.target.closest('input[type="number"]');
  if (!input) return;
  updateWeek((week) => setDayHours(week, input.dataset.date, input.value));
});

weekGrid.addEventListener("keydown", (event) => {
  const button = event.target.closest(".day-toggle");
  if (!button || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const buttons = [...weekGrid.querySelectorAll(".day-toggle")];
  const currentIndex = buttons.indexOf(button);
  const offset = event.key === "ArrowRight" ? 1 : -1;
  buttons[(currentIndex + offset + buttons.length) % buttons.length].focus();
});

render();
