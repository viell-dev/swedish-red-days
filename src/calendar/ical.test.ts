import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import type { Holiday } from "../holidays/types.js";
import { getSwedishRedDaysForRange } from "../holidays/swedish-red-days.js";
import { buildCalendar } from "./ical.js";

describe("buildCalendar", () => {
  const sampleHolidays: Holiday[] = [
    {
      name: "New Year's Day",
      swedishName: "Nyårsdagen",
      date: new Temporal.PlainDate(2026, 1, 1),
    },
    {
      name: "Christmas Day",
      swedishName: "Juldagen",
      date: new Temporal.PlainDate(2026, 12, 25),
    },
  ];

  it("produces valid iCal structure", () => {
    const ical = buildCalendar(sampleHolidays);

    expect(ical).toContain("BEGIN:VCALENDAR");
    expect(ical).toContain("END:VCALENDAR");
    expect(ical).toContain("VERSION:2.0");
    expect(ical).toContain("PRODID:-//Swedish Red Days//EN");
  });

  it("uses bilingual calendar name by default", () => {
    const ical = buildCalendar(sampleHolidays);
    expect(ical).toContain("NAME:Svenska röda dagar — Swedish Red Days");
  });

  it("uses Swedish calendar name when lang is 'swedish'", () => {
    const ical = buildCalendar(sampleHolidays, "swedish");
    expect(ical).toContain("NAME:Svenska röda dagar");
  });

  it("uses English calendar name when lang is 'english'", () => {
    const ical = buildCalendar(sampleHolidays, "english");
    expect(ical).toContain("NAME:Swedish Red Days");
  });

  it("creates all-day events", () => {
    const ical = buildCalendar(sampleHolidays);
    expect(ical).toContain("DTSTART;VALUE=DATE:20260101");
    expect(ical).toContain("DTSTART;VALUE=DATE:20261225");
  });

  it("uses both languages by default", () => {
    const ical = buildCalendar(sampleHolidays);
    expect(ical).toContain("SUMMARY:Nyårsdagen (New Year's Day)");
    expect(ical).toContain("SUMMARY:Juldagen (Christmas Day)");
  });

  it("uses only Swedish names when lang is 'swedish'", () => {
    const ical = buildCalendar(sampleHolidays, "swedish");
    expect(ical).toContain("SUMMARY:Nyårsdagen");
    expect(ical).toContain("SUMMARY:Juldagen");
    expect(ical).not.toContain("New Year's Day");
  });

  it("uses only English names when lang is 'english'", () => {
    const ical = buildCalendar(sampleHolidays, "english");
    expect(ical).toContain("SUMMARY:New Year's Day");
    expect(ical).toContain("SUMMARY:Christmas Day");
    expect(ical).not.toContain("Nyårsdagen");
  });

  it("creates one VEVENT per holiday", () => {
    const ical = buildCalendar(sampleHolidays);
    const eventCount = (ical.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(2);
  });

  it("handles empty holiday list", () => {
    const ical = buildCalendar([]);
    expect(ical).toContain("BEGIN:VCALENDAR");
    expect(ical).toContain("END:VCALENDAR");
    expect(ical).not.toContain("BEGIN:VEVENT");
  });

  describe("serialized structure", () => {
    const holidays2026 = getSwedishRedDaysForRange(2026, 2026);
    const ical = buildCalendar(holidays2026);
    const lines = ical.split("\r\n");

    it("contains exactly one VCALENDAR", () => {
      expect(lines.filter((l) => l === "BEGIN:VCALENDAR")).toHaveLength(1);
      expect(lines.filter((l) => l === "END:VCALENDAR")).toHaveLength(1);
      expect(lines[0]).toBe("BEGIN:VCALENDAR");
      expect(lines.at(-1) === "END:VCALENDAR" || lines.at(-2) === "END:VCALENDAR").toBe(true);
    });

    it("contains one VEVENT per holiday, all matched", () => {
      expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(holidays2026.length);
      expect(lines.filter((l) => l === "END:VEVENT")).toHaveLength(holidays2026.length);
    });

    it("makes every event an all-day date event on the holiday's date", () => {
      const dtstarts = lines.filter((l) => l.startsWith("DTSTART"));
      expect(dtstarts).toHaveLength(holidays2026.length);

      const expected = holidays2026.map((h) => h.date.toString().replaceAll("-", ""));
      expect(dtstarts).toEqual(expected.map((d) => `DTSTART;VALUE=DATE:${d}`));
    });

    it("emits events in chronological order", () => {
      const dates = lines
        .filter((l) => l.startsWith("DTSTART;VALUE=DATE:"))
        .map((l) => l.slice("DTSTART;VALUE=DATE:".length));
      expect(dates).toEqual([...dates].sort());
    });

    it("preserves apostrophes and Swedish characters in summaries", () => {
      expect(ical).toContain("SUMMARY:Nyårsdagen (New Year's Day)");
      expect(ical).toContain("SUMMARY:Kristi himmelsfärdsdag (Ascension Day)");
      expect(ical).toContain("SUMMARY:Annandag påsk (Easter Monday)");
    });
  });

  describe("event UIDs", () => {
    it("derives stable readable UIDs from date and English name", () => {
      const ical = buildCalendar(sampleHolidays);
      expect(ical).toContain("UID:2026-01-01-new-year-s-day@swedish-red-days");
      expect(ical).toContain("UID:2026-12-25-christmas-day@swedish-red-days");
    });

    it("keeps UIDs identical across repeated calls", () => {
      const extractUids = (ical: string): string[] =>
        ical.split("\r\n").filter((l) => l.startsWith("UID:"));

      const first = extractUids(buildCalendar(sampleHolidays));
      const second = extractUids(buildCalendar(sampleHolidays));
      expect(first).toEqual(second);
    });

    it("keeps UIDs identical across languages", () => {
      const extractUids = (ical: string): string[] =>
        ical.split("\r\n").filter((l) => l.startsWith("UID:"));

      expect(extractUids(buildCalendar(sampleHolidays, "swedish"))).toEqual(
        extractUids(buildCalendar(sampleHolidays, "english")),
      );
    });

    it("gives every event a unique UID for a full year including Sundays", () => {
      const holidays = getSwedishRedDaysForRange(2026, 2026, { includeSundays: true });
      const uids = buildCalendar(holidays)
        .split("\r\n")
        .filter((l) => l.startsWith("UID:"));

      expect(uids).toHaveLength(holidays.length);
      expect(new Set(uids).size).toBe(uids.length);
    });
  });

  it("matches the golden snapshot for 2026 after normalizing DTSTAMP", () => {
    const holidays = getSwedishRedDaysForRange(2026, 2026);
    const normalized = buildCalendar(holidays).replaceAll(
      /DTSTAMP:\d{8}T\d{6}Z?/g,
      "DTSTAMP:NORMALIZED",
    );
    expect(normalized).toMatchSnapshot();
  });
});
