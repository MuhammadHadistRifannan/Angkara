export function getTodayWib(now: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export function isPastWib(dateStr: string, now: Date): boolean {
  const todayWib = getTodayWib(now);
  return dateStr < todayWib;
}
