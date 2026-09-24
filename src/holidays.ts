import { dateKey, parseLocalDate } from "./dates.js";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

export type HolidayInput = Omit<Holiday, "id">;

export function validateHoliday(value: HolidayInput): HolidayInput {
  if (!value.name?.trim()) throw new Error("Informe o nome do feriado.");
  parseLocalDate(value.date);
  if (typeof value.allDay !== "boolean") throw new Error("Informe o período do feriado.");
  if (!value.allDay) {
    if (!value.startTime || !value.endTime) throw new Error("Informe o início e o fim do período.");
    parseLocalDate(value.date, value.startTime);
    parseLocalDate(value.date, value.endTime);
    if (value.endTime <= value.startTime) throw new Error("O fim deve ser depois do início, no mesmo dia.");
  }
  return {
    name: value.name.trim(), date: value.date, allDay: value.allDay,
    startTime: value.allDay ? null : value.startTime,
    endTime: value.allDay ? null : value.endTime,
  };
}

/** Half-open intervals: ending exactly when a holiday starts is allowed. */
export function overlappingHolidays(holidays: Holiday[], start: Date, durationMinutes = 45): Holiday[] {
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return holidays.filter(holiday => {
    const holidayStart = parseLocalDate(holiday.date, holiday.allDay ? "00:00" : holiday.startTime!);
    const holidayEnd = parseLocalDate(holiday.date, holiday.allDay ? "00:00" : holiday.endTime!);
    if (holiday.allDay) holidayEnd.setDate(holidayEnd.getDate() + 1);
    return start < holidayEnd && end > holidayStart;
  });
}

export function holidayPeriod(holiday: HolidayInput): string {
  return holiday.allDay ? "Dia inteiro" : `${holiday.startTime} – ${holiday.endTime}`;
}

export function slotDate(date: Date, time: string): Date {
  const [hour, minute = "0"] = time.split(/[h:]/);
  return parseLocalDate(dateKey(date), `${hour!.padStart(2, "0")}:${(minute || "0").padStart(2, "0")}`);
}

export function appointmentHolidayState(holidays: Holiday[], date: Date, recurring: boolean) {
  const conflicts = overlappingHolidays(holidays, date);
  return { conflicts, skipped: recurring && conflicts.length > 0 };
}
