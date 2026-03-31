import { describe, expect, it } from "vitest";
import { getEasterSunday } from "./easter.js";

describe("getEasterSunday", () => {
  // Known Easter dates from multiple sources
  const knownEasterDates: [number, string][] = [
    [2000, "2000-04-23"],
    [2005, "2005-03-27"],
    [2010, "2010-04-04"],
    [2015, "2015-04-05"],
    [2020, "2020-04-12"],
    [2021, "2021-04-04"],
    [2022, "2022-04-17"],
    [2023, "2023-04-09"],
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2028, "2028-04-16"],
    [2029, "2029-04-01"],
    [2030, "2030-04-21"],
  ];

  it.each(knownEasterDates)("returns correct date for year %i", (year, expected) => {
    expect(getEasterSunday(year).toString()).toBe(expected);
  });

  it("always falls on a Sunday", () => {
    for (let year = 2000; year <= 2050; year++) {
      const easter = getEasterSunday(year);
      expect(easter.dayOfWeek, `Easter ${year} should be Sunday`).toBe(7);
    }
  });

  it("always falls in March or April", () => {
    for (let year = 2000; year <= 2050; year++) {
      const easter = getEasterSunday(year);
      expect([3, 4]).toContain(easter.month);
    }
  });
});
