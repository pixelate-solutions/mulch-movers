const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function localDateValue(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(value: string) {
  if (!value) {
    return "";
  }

  return displayDateFormatter
    .format(parseDateValue(value))
    .replace(/^([A-Z][a-z]{2}) /, "$1. ");
}
