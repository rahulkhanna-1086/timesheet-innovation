const DAY_COUNT = 7;
const DEFAULT_HOURS = 8;

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getWeekStart(date = new Date()) {
  const utcDate = fromDateKey(toDateKey(date));
  const daysSinceMonday = (utcDate.getUTCDay() + 6) % DAY_COUNT;
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday);
  return utcDate.toISOString().slice(0, 10);
}

export function getEditableDateLimit(today = new Date()) {
  return addDays(toDateKey(today), -14);
}

export function isDateEditable(date, earliestEditableDate) {
  return !earliestEditableDate || date >= earliestEditableDate;
}

export function addDays(dateKey, amount) {
  const date = fromDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function createWeek(weekStart) {
  return Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = addDays(weekStart, index);
    return { date, selected: false, hours: DEFAULT_HOURS };
  });
}

export function getTwoWeekDays(weekStart, savedWeeks = {}) {
  const previousWeekStart = addDays(weekStart, -7);
  return [
    ...(savedWeeks[previousWeekStart] || createWeek(previousWeekStart)),
    ...(savedWeeks[weekStart] || createWeek(weekStart)),
  ];
}

export function setWeekdays(week, earliestEditableDate) {
  return week.map((day, index) => ({
    ...day,
    selected: isDateEditable(day.date, earliestEditableDate) ? index < 5 : day.selected,
  }));
}

export function clearWeek(week, earliestEditableDate) {
  return week.map((day) => ({
    ...day,
    selected: isDateEditable(day.date, earliestEditableDate) ? false : day.selected,
  }));
}

export function toggleDay(week, date, earliestEditableDate) {
  return week.map((day) => (
    day.date === date && isDateEditable(day.date, earliestEditableDate)
      ? { ...day, selected: !day.selected }
      : day
  ));
}

export function setDayHours(week, date, value, earliestEditableDate) {
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
    return week;
  }
  return week.map((day) => (
    day.date === date && isDateEditable(day.date, earliestEditableDate)
      ? { ...day, hours }
      : day
  ));
}

export function getWeekSummary(week) {
  const selectedDays = week.filter((day) => day.selected);
  return {
    dayCount: selectedDays.length,
    totalHours: selectedDays.reduce((total, day) => total + day.hours, 0),
  };
}
