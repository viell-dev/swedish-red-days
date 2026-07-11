import icalGenerator from "ical-generator";
import type { Lang } from "../config.js";
import type { Holiday } from "../holidays/types.js";

const calendarNames: Record<Lang, string> = {
  swedish: "Svenska röda dagar",
  english: "Swedish Red Days",
  both: "Svenska röda dagar — Swedish Red Days",
};

/**
 * Stable UID derived from date and English name, so calendar clients can
 * match events across refreshes instead of duplicating them.
 */
function eventId(holiday: Holiday): string {
  const slug = holiday.name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
  return `${holiday.date.toString()}-${slug}@swedish-red-days`;
}

function formatSummary(holiday: Holiday, lang: Lang): string {
  switch (lang) {
    case "swedish":
      return holiday.swedishName;
    case "english":
      return holiday.name;
    case "both":
      return `${holiday.swedishName} (${holiday.name})`;
  }
}

export function buildCalendar(holidays: Holiday[], lang: Lang = "both"): string {
  const calendar = icalGenerator({
    name: calendarNames[lang],
    prodId: "//Swedish Red Days//EN",
    timezone: "Europe/Stockholm",
  });

  for (const holiday of holidays) {
    calendar.createEvent({
      id: eventId(holiday),
      start: new Date(holiday.date.toString()),
      allDay: true,
      summary: formatSummary(holiday, lang),
    });
  }

  return calendar.toString();
}
