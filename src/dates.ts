/** Calendar dates are local dates, never UTC-midnight timestamps. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseLocalDate(value: string, time = "00:00"): Date {
  const [year, month, day] = value.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(year!, month! - 1, day!, hour!, minute!, 0, 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || dateKey(date) !== value ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("Informe uma data e um horário válidos.");
  }
  return date;
}

export function weekDate(selected: Date, dayIndex: number): Date {
  const date = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  // Keep the app's convention: Sunday selects the following week.
  date.setDate(date.getDate() + (date.getDay() === 0 ? 1 : 1 - date.getDay()) + dayIndex - 1);
  return date;
}
