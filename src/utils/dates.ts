export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function clampDueDay(dueDay: number, date = new Date()): number {
  return Math.min(dueDay, daysInMonth(date.getFullYear(), date.getMonth()));
}

export function billDueDate(dueDay: number, date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), clampDueDay(dueDay, date));
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function ordinal(day: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = day % 100;
  return `${day}${suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]}`;
}
