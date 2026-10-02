import test from "node:test";
import assert from "node:assert/strict";
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
  toggleDay,
} from "../src/planner.js";

test("weeks start on Monday and navigate across month boundaries", () => {
  assert.equal(getWeekStart(new Date(2026, 9, 2)), "2026-09-28");
  assert.equal(addDays("2026-09-28", 7), "2026-10-05");
});

test("the planner shows two consecutive full weeks", () => {
  const days = getTwoWeekDays("2026-09-28");
  assert.equal(days.length, 14);
  assert.equal(days[0].date, "2026-09-21");
  assert.equal(days[13].date, "2026-10-04");
});

test("days exactly 14 days old remain editable, older days are locked", () => {
  const limit = getEditableDateLimit(new Date(2026, 9, 2));
  assert.equal(limit, "2026-09-18");
  assert.equal(isDateEditable("2026-09-18", limit), true);
  assert.equal(isDateEditable("2026-09-17", limit), false);
});

test("weekday quick-add selects Monday through Friday", () => {
  const week = setWeekdays(createWeek("2026-09-28"));
  assert.deepEqual(week.map((day) => day.selected), [true, true, true, true, true, false, false]);
});

test("bulk actions and day edits preserve locked dates", () => {
  const week = setDayHours(createWeek("2026-09-14"), "2026-09-17", "6");
  const selected = toggleDay(week, "2026-09-17");
  const edited = setDayHours(selected, "2026-09-17", "7.5", "2026-09-18");
  const cleared = clearWeek(edited, "2026-09-18");
  const weekdays = setWeekdays(cleared, "2026-09-18");

  assert.equal(edited[3].hours, 6);
  assert.equal(edited[3].selected, true);
  assert.equal(cleared[3].selected, true);
  assert.equal(weekdays[3].selected, true);
});

test("a day can be toggled without changing its hours", () => {
  const week = toggleDay(createWeek("2026-09-28"), "2026-09-29");
  assert.equal(week[1].selected, true);
  assert.equal(week[1].hours, 8);
  assert.equal(week[0].selected, false);
});

test("clear week preserves entered hours but removes all planned days", () => {
  const withHours = setDayHours(setWeekdays(createWeek("2026-09-28")), "2026-09-28", "7.5");
  const cleared = clearWeek(withHours);
  assert.equal(cleared.every((day) => !day.selected), true);
  assert.equal(cleared[0].hours, 7.5);
});

test("summary totals only selected days", () => {
  const week = setDayHours(setWeekdays(createWeek("2026-09-28")), "2026-09-28", "7.5");
  assert.deepEqual(getWeekSummary(week), { dayCount: 5, totalHours: 39.5 });
});

test("invalid hour values are rejected", () => {
  const week = createWeek("2026-09-28");
  assert.equal(setDayHours(week, "2026-09-28", "25"), week);
  assert.equal(setDayHours(week, "2026-09-28", "nope"), week);
});
