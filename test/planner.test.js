import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  clearWeek,
  createWeek,
  getWeekStart,
  getWeekSummary,
  setDayHours,
  setWeekdays,
  toggleDay,
} from "../src/planner.js";

test("weeks start on Monday and navigate across month boundaries", () => {
  assert.equal(getWeekStart(new Date(2026, 9, 2)), "2026-09-28");
  assert.equal(addDays("2026-09-28", 7), "2026-10-05");
});

test("weekday quick-add selects Monday through Friday", () => {
  const week = setWeekdays(createWeek("2026-09-28"));
  assert.deepEqual(week.map((day) => day.selected), [true, true, true, true, true, false, false]);
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
