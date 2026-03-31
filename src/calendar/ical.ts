import icalGenerator from "ical-generator";
import type { Lang } from "../config.js";
import type { Holiday } from "../holidays/types.js";

const calendarNames: Record<Lang, string> = {
  swedish: "Svenska röda dagar",
  english: "Swedish Red Days",
  both: "Svenska röda dagar — Swedish Red Days",
};

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
      start: new Date(holiday.date.toString()),
      allDay: true,
      summary: formatSummary(holiday, lang),
    });
  }

  return calendar.toString();
}
