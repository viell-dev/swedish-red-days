import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import { getSwedishRedDays, getSwedishRedDaysForRange } from "./swedish-red-days.js";

describe("getSwedishRedDays", () => {
  it("returns 13 holidays per year", () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      expect(getSwedishRedDays(year)).toHaveLength(13);
    }
  });

  it("includes all expected holiday names", () => {
    const holidays = getSwedishRedDays(2026);
    const names = holidays.map((h) => h.name);

    expect(names).toEqual([
      "New Year's Day",
      "Epiphany",
      "Good Friday",
      "Easter Sunday",
      "Easter Monday",
      "May Day",
      "Ascension Day",
      "Whit Sunday",
      "National Day",
      "Midsummer Day",
      "All Saints' Day",
      "Christmas Day",
      "Second Day of Christmas",
    ]);
  });

  it("returns correct fixed-date holidays", () => {
    const holidays = getSwedishRedDays(2026);
    const byName = Object.fromEntries(holidays.map((h) => [h.name, h.date.toString()]));

    expect(byName["New Year's Day"]).toBe("2026-01-01");
    expect(byName["Epiphany"]).toBe("2026-01-06");
    expect(byName["May Day"]).toBe("2026-05-01");
    expect(byName["National Day"]).toBe("2026-06-06");
    expect(byName["Christmas Day"]).toBe("2026-12-25");
    expect(byName["Second Day of Christmas"]).toBe("2026-12-26");
  });

  it("returns correct Easter-relative holidays for 2026", () => {
    // Easter 2026 is April 5
    const holidays = getSwedishRedDays(2026);
    const byName = Object.fromEntries(holidays.map((h) => [h.name, h.date.toString()]));

    expect(byName["Good Friday"]).toBe("2026-04-03");
    expect(byName["Easter Sunday"]).toBe("2026-04-05");
    expect(byName["Easter Monday"]).toBe("2026-04-06");
    expect(byName["Ascension Day"]).toBe("2026-05-14");
    expect(byName["Whit Sunday"]).toBe("2026-05-24");
  });

  it("returns correct Easter-relative holidays for 2024", () => {
    // Easter 2024 is March 31
    const holidays = getSwedishRedDays(2024);
    const byName = Object.fromEntries(holidays.map((h) => [h.name, h.date.toString()]));

    expect(byName["Good Friday"]).toBe("2024-03-29");
    expect(byName["Easter Sunday"]).toBe("2024-03-31");
    expect(byName["Easter Monday"]).toBe("2024-04-01");
    expect(byName["Ascension Day"]).toBe("2024-05-09");
    expect(byName["Whit Sunday"]).toBe("2024-05-19");
  });

  describe("Midsummer Day", () => {
    it("always falls on a Saturday between June 20-26", () => {
      for (let year = 2000; year <= 2050; year++) {
        const holidays = getSwedishRedDays(year);
        const midsummer = holidays.find((h) => h.name === "Midsummer Day")!;

        expect(midsummer.date.dayOfWeek, `${year}: should be Saturday`).toBe(6);
        expect(midsummer.date.month).toBe(6);
        expect(midsummer.date.day).toBeGreaterThanOrEqual(20);
        expect(midsummer.date.day).toBeLessThanOrEqual(26);
      }
    });

    it("returns known Midsummer dates", () => {
      const cases: [number, string][] = [
        [2023, "2023-06-24"], // Jun 20 is Tue → Sat = Jun 24
        [2024, "2024-06-22"], // Jun 20 is Thu → Sat = Jun 22
        [2025, "2025-06-21"], // Jun 20 is Fri → Sat = Jun 21
        [2026, "2026-06-20"], // Jun 20 is Sat → Jun 20
      ];

      for (const [year, expected] of cases) {
        const holidays = getSwedishRedDays(year);
        const midsummer = holidays.find((h) => h.name === "Midsummer Day")!;
        expect(midsummer.date.toString(), `Midsummer ${year}`).toBe(expected);
      }
    });
  });

  describe("All Saints' Day", () => {
    it("always falls on a Saturday between Oct 31 and Nov 6", () => {
      for (let year = 2000; year <= 2050; year++) {
        const holidays = getSwedishRedDays(year);
        const allSaints = holidays.find((h) => h.name === "All Saints' Day")!;
        const oct31 = new Temporal.PlainDate(year, 10, 31);
        const nov6 = new Temporal.PlainDate(year, 11, 6);

        expect(allSaints.date.dayOfWeek, `${year}: should be Saturday`).toBe(6);
        expect(
          Temporal.PlainDate.compare(allSaints.date, oct31) >= 0,
          `${year}: should be on or after Oct 31`,
        ).toBe(true);
        expect(
          Temporal.PlainDate.compare(allSaints.date, nov6) <= 0,
          `${year}: should be on or before Nov 6`,
        ).toBe(true);
      }
    });

    it("returns known All Saints' dates", () => {
      const cases: [number, string][] = [
        [2023, "2023-11-04"], // Oct 31 is Tue → Sat = Nov 4
        [2024, "2024-11-02"], // Oct 31 is Thu → Sat = Nov 2
        [2025, "2025-11-01"], // Oct 31 is Fri → Sat = Nov 1
        [2026, "2026-10-31"], // Oct 31 is Sat → Oct 31
      ];

      for (const [year, expected] of cases) {
        const holidays = getSwedishRedDays(year);
        const allSaints = holidays.find((h) => h.name === "All Saints' Day")!;
        expect(allSaints.date.toString(), `All Saints' ${year}`).toBe(expected);
      }
    });
  });

  it("has Swedish names for all holidays", () => {
    const holidays = getSwedishRedDays(2026);
    for (const holiday of holidays) {
      expect(holiday.swedishName).toBeTruthy();
      expect(holiday.swedishName.length).toBeGreaterThan(0);
    }
  });

  it("returns all dates within the given year", () => {
    for (const year of [2023, 2024, 2025, 2026]) {
      const holidays = getSwedishRedDays(year);
      for (const holiday of holidays) {
        expect(holiday.date.year, `${holiday.name} in ${year}`).toBe(year);
      }
    }
  });
});

describe("getSwedishRedDaysForRange", () => {
  function expectChronologicalOrder(dates: string[]): void {
    expect(dates).toEqual([...dates].sort());
  }

  it("returns holidays for all years in the range (inclusive)", () => {
    const holidays = getSwedishRedDaysForRange(2024, 2026);
    expect(holidays).toHaveLength(13 * 3);
  });

  it("returns holidays in year order", () => {
    const holidays = getSwedishRedDaysForRange(2024, 2026);
    const years = holidays.map((h) => h.date.year);
    const uniqueYears = [...new Set(years)];
    expect(uniqueYears).toEqual([2024, 2025, 2026]);
  });

  it("returns empty array when startYear > endYear", () => {
    expect(getSwedishRedDaysForRange(2026, 2024)).toEqual([]);
  });

  it("handles single-year range", () => {
    const holidays = getSwedishRedDaysForRange(2026, 2026);
    expect(holidays).toHaveLength(13);
  });

  describe("includeSundays", () => {
    it("adds Sundays when enabled", () => {
      const without = getSwedishRedDaysForRange(2026, 2026);
      const with_ = getSwedishRedDaysForRange(2026, 2026, { includeSundays: true });
      expect(with_.length).toBeGreaterThan(without.length);

      const sundays = with_.filter((h) => h.name === "Sunday");
      for (const sunday of sundays) {
        expect(sunday.date.dayOfWeek).toBe(7);
      }
    });

    it("does not add a Sunday event when a named holiday falls on that Sunday", () => {
      // Easter Sunday and Whit Sunday always fall on Sundays
      const holidays = getSwedishRedDaysForRange(2026, 2026, { includeSundays: true });
      const easterDate = holidays.find((h) => h.name === "Easter Sunday")!.date.toString();
      const whitDate = holidays.find((h) => h.name === "Whit Sunday")!.date.toString();

      const sundayDates = holidays.filter((h) => h.name === "Sunday").map((h) => h.date.toString());
      expect(sundayDates).not.toContain(easterDate);
      expect(sundayDates).not.toContain(whitDate);
    });

    it("has no duplicate dates when Sundays are included", () => {
      const holidays = getSwedishRedDaysForRange(2026, 2026, { includeSundays: true });
      const dates = holidays.map((h) => h.date.toString());
      expect(new Set(dates).size).toBe(dates.length);
    });

    it("returns holidays in chronological order when Sundays are included", () => {
      const holidays = getSwedishRedDaysForRange(2026, 2026, { includeSundays: true });
      expectChronologicalOrder(holidays.map((h) => h.date.toString()));
    });

    it("does not add Sundays by default", () => {
      const holidays = getSwedishRedDaysForRange(2026, 2026);
      expect(holidays.filter((h) => h.name === "Sunday")).toHaveLength(0);
    });
  });

  describe("skipWeekends", () => {
    it("removes holidays falling on Saturday or Sunday", () => {
      const all = getSwedishRedDaysForRange(2026, 2026);
      const filtered = getSwedishRedDaysForRange(2026, 2026, { skipWeekends: true });

      const weekendHolidays = all.filter((h) => h.date.dayOfWeek >= 6);
      expect(filtered.length).toBe(all.length - weekendHolidays.length);

      for (const holiday of filtered) {
        expect(holiday.date.dayOfWeek).toBeLessThanOrEqual(5);
      }
    });

    it("skipWeekends supersedes includeSundays", () => {
      const skipped = getSwedishRedDaysForRange(2026, 2026, { skipWeekends: true });
      const both = getSwedishRedDaysForRange(2026, 2026, {
        includeSundays: true,
        skipWeekends: true,
      });
      expect(both).toEqual(skipped);
    });
  });

  it("returns multi-year ranges in chronological order", () => {
    const holidays = getSwedishRedDaysForRange(2025, 2026, { includeSundays: true });
    expectChronologicalOrder(holidays.map((h) => h.date.toString()));
  });
});
