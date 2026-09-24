import { describe, expect, it } from "vitest";
import { dateKey, parseLocalDate, weekDate } from "./dates.js";
import { appointmentHolidayState, overlappingHolidays, slotDate, validateHoliday, type Holiday } from "./holidays.js";

const holiday: Holiday = { id: "holiday", name: "Feriado", date: "2026-09-23", allDay: false, startTime: "14:15", endTime: "16:30" };

describe("holiday overlap", () => {
  it.each([
    ["13:30", false], ["13:31", true], ["14:00", true],
    ["16:15", true], ["16:30", false], ["17:00", false],
  ])("checks a 45-minute appointment at %s (including exact boundaries)", (time, blocked) => {
    expect(overlappingHolidays([holiday], parseLocalDate(holiday.date, time)).length > 0).toBe(blocked);
  });

  it("blocks the whole day, but not the same date in a different year", () => {
    const allDay = { ...holiday, allDay: true, startTime: null, endTime: null };
    for (const time of ["00:00", "09:00", "19:00", "23:59"]) {
      expect(overlappingHolidays([allDay], parseLocalDate(holiday.date, time))).toHaveLength(1);
    }
    expect(overlappingHolidays([allDay], parseLocalDate("2027-09-23", "14:00"))).toHaveLength(0);
    expect(overlappingHolidays([allDay], parseLocalDate("2026-09-24", "00:00"))).toHaveLength(0);
  });

  it("supports Saturday hours and partial overlaps", () => {
    const saturday = { ...holiday, date: "2026-09-26", startTime: "09:30", endTime: "10:00" };
    expect(overlappingHolidays([saturday], slotDate(parseLocalDate(saturday.date), "9h"))).toHaveLength(1);
    expect(overlappingHolidays([saturday], slotDate(parseLocalDate(saturday.date), "10h"))).toHaveLength(0);
  });

  it("retains a block until all overlapping holidays are removed", () => {
    const second = { ...holiday, id: "second" };
    const start = parseLocalDate(holiday.date, "14:00");
    expect(overlappingHolidays([holiday, second], start)).toHaveLength(2);
    expect(overlappingHolidays([second], start)).toHaveLength(1);
    expect(overlappingHolidays([], start)).toHaveLength(0);
  });

  it("skips only recurring occurrences and restores them after removal", () => {
    const start = parseLocalDate(holiday.date, "14:00");
    expect(appointmentHolidayState([holiday], start, true).skipped).toBe(true);
    expect(appointmentHolidayState([holiday], start, false)).toEqual({ conflicts: [holiday], skipped: false });
    expect(appointmentHolidayState([], start, true).skipped).toBe(false);
    expect(appointmentHolidayState([holiday], parseLocalDate("2026-09-30", "14:00"), true).skipped).toBe(false);
  });
});

describe("holiday form validation", () => {
  it.each([
    { name: "  " }, { date: "2026-02-30" }, { startTime: null },
    { startTime: "25:00" }, { endTime: "14:15" }, { endTime: "09:00" },
  ])("rejects invalid fields %j", fields => {
    expect(() => validateHoliday({ ...holiday, ...fields })).toThrow();
  });
  it("clears custom hours for an all-day holiday and trims the name", () => {
    expect(validateHoliday({ ...holiday, name: "  Carnaval  ", allDay: true }))
      .toMatchObject({ name: "Carnaval", startTime: null, endTime: null });
  });
});

describe("local calendar dates", () => {
  it("keeps the selected year across a week boundary", () => {
    const selected = parseLocalDate("2027-01-01");
    expect(dateKey(weekDate(selected, 1))).toBe("2026-12-28");
    expect(dateKey(weekDate(selected, 6))).toBe("2027-01-02");
    expect(weekDate(selected, 1).getHours()).toBe(0);
  });
  it("uses the following Monday when selecting a Sunday", () => {
    expect(dateKey(weekDate(parseLocalDate("2026-09-27"), 1))).toBe("2026-09-28");
  });
  it("parses date inputs without shifting a day and accepts leap day", () => {
    expect(dateKey(parseLocalDate("2028-02-29", "09:15"))).toBe("2028-02-29");
    expect(slotDate(parseLocalDate("2027-01-02"), "9h").getHours()).toBe(9);
  });
});
