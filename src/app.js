import {
  addDays,
  clearWeek,
  createWeek,
  getEditableDateLimit,
  getTwoWeekDays,
  getWeekStart,
  getWeekSummary,
  isDateEditable,
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

function saveWeeks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weeks: state.weeks }));
    saveMessage.textContent = "Saved on this device";
  } catch {
    saveMessage.textContent = "Could not save on this device";
  }
}

function formatWeekRange(startKey, endKey) {
  const start = new Date(`${startKey}T12:00:00`);
  const end = new Date(`${endKey}T12:00:00`);
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
  const days = getTwoWeekDays(state.weekStart, state.weeks);
  const summary = getWeekSummary(days);
  const earliestEditableDate = getEditableDateLimit();
  const rangeStart = days[0].date;
  const rangeEnd = days[days.length - 1].date;

  weekLabel.textContent = formatWeekRange(rangeStart, rangeEnd);
  monthLabel.textContent = "TWO-WEEK VIEW";
  summaryDays.textContent = `${summary.dayCount} ${summary.dayCount === 1 ? "day" : "days"}`;
  summaryHours.textContent = `${Number(summary.totalHours.toFixed(2))}h`;
  todayButton.disabled = getWeekStart() === state.weekStart;
  document.querySelector("#previous-week").disabled =
    addDays(state.weekStart, -1) < earliestEditableDate;
  weekGrid.replaceChildren(
    renderWeekRow(days.slice(0, 7), "Week 1", earliestEditableDate),
    renderWeekRow(days.slice(7), "Week 2", earliestEditableDate),
  );
}

function renderWeekRow(days, heading, earliestEditableDate) {
  const section = document.createElement("section");
  section.className = "week-row";
  section.setAttribute("aria-label", `${heading}, ${formatWeekRange(days[0].date, days[6].date)}`);

  const title = document.createElement("h3");
  title.className = "week-row-heading";
  const weekName = document.createElement("span");
  weekName.textContent = heading;
  const dateRange = document.createElement("span");
  dateRange.textContent = formatWeekRange(days[0].date, days[6].date);
  title.append(weekName, dateRange);

  const grid = document.createElement("div");
  grid.className = "week-row-grid";
  grid.append(...days.map((day) => renderDay(day, earliestEditableDate)));
  section.append(title, grid);
  return section;
}

function renderDay(day, earliestEditableDate) {
  const date = formatDay(day.date);
  const editable = isDateEditable(day.date, earliestEditableDate);
  const article = document.createElement("article");
  article.className = `day-card${day.selected ? " is-selected" : ""}${day.date === todayKey ? " is-today" : ""}${editable ? "" : " is-locked"}`;

  const button = document.createElement("button");
  button.className = "day-toggle";
  button.type = "button";
  button.disabled = !editable;
  button.setAttribute("aria-pressed", String(day.selected));
  button.setAttribute(
    "aria-label",
    `${date.fullWeekday}, ${date.month} ${Number(date.day)}: ${day.selected ? "planned" : "not planned"}${editable ? "" : ", locked because it is more than 14 days old"}`,
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
  stateLabel.textContent = editable ? (day.selected ? "Planned" : "Add day") : "Locked";
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
    hours.disabled = !editable;
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
    hint.textContent = editable ? "Tap to add" : "Outside edit window";
    article.append(hint);
  }

  return article;
}

function updateDisplayedWeeks(update) {
  const firstWeekStart = addDays(state.weekStart, -7);
  for (const weekStart of [firstWeekStart, state.weekStart]) {
    state.weeks[weekStart] = update(state.weeks[weekStart] || createWeek(weekStart));
  }
  saveWeeks();
  render();
}

function updateDay(date, update) {
  const weekStart = getWeekStart(new Date(`${date}T12:00:00`));
  const week = state.weeks[weekStart] || createWeek(weekStart);
  state.weeks[weekStart] = update(week);
  saveWeeks();
  render();
}

document.querySelector("#previous-week").addEventListener("click", () => {
  if (addDays(state.weekStart, -1) < getEditableDateLimit()) return;
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
  const earliestEditableDate = getEditableDateLimit();
  updateDisplayedWeeks((week) => setWeekdays(week, earliestEditableDate));
});

document.querySelector("#clear-button").addEventListener("click", () => {
  const earliestEditableDate = getEditableDateLimit();
  updateDisplayedWeeks((week) => clearWeek(week, earliestEditableDate));
});

weekGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".day-toggle");
  if (!button || button.disabled) return;
  const earliestEditableDate = getEditableDateLimit();
  updateDay(button.dataset.date, (week) => toggleDay(week, button.dataset.date, earliestEditableDate));
});

weekGrid.addEventListener("change", (event) => {
  const input = event.target.closest('input[type="number"]');
  if (!input || input.disabled) return;
  const earliestEditableDate = getEditableDateLimit();
  updateDay(input.dataset.date, (week) => setDayHours(week, input.dataset.date, input.value, earliestEditableDate));
});

weekGrid.addEventListener("keydown", (event) => {
  const button = event.target.closest(".day-toggle");
  if (!button || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const buttons = [...weekGrid.querySelectorAll(".day-toggle:not(:disabled)")];
  const currentIndex = buttons.indexOf(button);
  const offset = event.key === "ArrowRight" ? 1 : -1;
  buttons[(currentIndex + offset + buttons.length) % buttons.length].focus();
});

render();
