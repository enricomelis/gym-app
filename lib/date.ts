const italianDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatItalianDate(date: Date): string {
  return italianDateFormatter.format(date);
}
