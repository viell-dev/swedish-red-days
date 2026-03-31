import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import type { Holiday } from "../holidays/types.js";
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
});
