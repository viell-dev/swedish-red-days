import { Temporal } from "temporal-polyfill";
import type { Holiday } from "./types.js";
import { getEasterSunday } from "./easter.js";

/** Find the next Saturday on or after a given date. */
function nextSaturday(date: Temporal.PlainDate): Temporal.PlainDate {
  // Temporal: dayOfWeek 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun
  const daysUntilSaturday = (6 - date.dayOfWeek + 7) % 7;
  return date.add({ days: daysUntilSaturday });
}

/** Returns all Swedish public holidays ("red days") for a given year. */
export function getSwedishRedDays(year: number): Holiday[] {
  const easter = getEasterSunday(year);

  return [
    {
      name: "New Year's Day",
      swedishName: "Nyårsdagen",
      date: new Temporal.PlainDate(year, 1, 1),
    },
    {
      name: "Epiphany",
      swedishName: "Trettondedag jul",
      date: new Temporal.PlainDate(year, 1, 6),
    },
    {
      name: "Good Friday",
      swedishName: "Långfredagen",
      date: easter.subtract({ days: 2 }),
    },
    {
      name: "Easter Sunday",
      swedishName: "Påskdagen",
      date: easter,
    },
    {
      name: "Easter Monday",
      swedishName: "Annandag påsk",
      date: easter.add({ days: 1 }),
    },
    {
      name: "May Day",
      swedishName: "Första maj",
      date: new Temporal.PlainDate(year, 5, 1),
    },
    {
      name: "Ascension Day",
      swedishName: "Kristi himmelsfärdsdag",
      date: easter.add({ days: 39 }),
    },
    {
      name: "Whit Sunday",
      swedishName: "Pingstdagen",
      date: easter.add({ days: 49 }),
    },
    {
      name: "National Day",
      swedishName: "Sveriges nationaldag",
      date: new Temporal.PlainDate(year, 6, 6),
    },
    {
      name: "Midsummer Day",
      swedishName: "Midsommardagen",
      date: nextSaturday(new Temporal.PlainDate(year, 6, 20)),
    },
    {
      name: "All Saints' Day",
      swedishName: "Alla helgons dag",
      date: nextSaturday(new Temporal.PlainDate(year, 10, 31)),
    },
    {
      name: "Christmas Day",
      swedishName: "Juldagen",
      date: new Temporal.PlainDate(year, 12, 25),
    },
    {
      name: "Second Day of Christmas",
      swedishName: "Annandag jul",
      date: new Temporal.PlainDate(year, 12, 26),
    },
  ];
}

/** Returns all Sundays in a given year. */
function getSundays(year: number): Holiday[] {
  const sundays: Holiday[] = [];
  let date = new Temporal.PlainDate(year, 1, 1);
  // Advance to the first Sunday
  const daysUntilSunday = (7 - date.dayOfWeek) % 7;
  date = date.add({ days: daysUntilSunday });

  while (date.year === year) {
    sundays.push({ name: "Sunday", swedishName: "Söndag", date });
    date = date.add({ days: 7 });
  }
  return sundays;
}

export interface RedDaysOptions {
  includeSundays?: boolean;
  skipWeekends?: boolean;
}

/** Returns all Swedish red days for a range of years (inclusive). */
export function getSwedishRedDaysForRange(
  startYear: number,
  endYear: number,
  options: RedDaysOptions = {},
): Holiday[] {
  const { includeSundays = false, skipWeekends = false } = options;
  const holidays: Holiday[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const namedHolidays = getSwedishRedDays(year);
    holidays.push(...namedHolidays);
    if (includeSundays && !skipWeekends) {
      const holidayDates = new Set(namedHolidays.map((h) => h.date.toString()));
      holidays.push(...getSundays(year).filter((s) => !holidayDates.has(s.date.toString())));
    }
  }

  if (skipWeekends) {
    return holidays.filter((h) => h.date.dayOfWeek <= 5);
  }

  return holidays;
}
