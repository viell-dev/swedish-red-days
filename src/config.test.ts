import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";
import { getConfig } from "./config.js";

const currentYear = Temporal.Now.plainDateISO().year;

describe("getConfig", () => {
  describe("year range", () => {
    it("uses default values when env vars are not set", () => {
      const config = getConfig({});
      expect(config.startYear).toBe(currentYear - 3);
      expect(config.endYear).toBe(currentYear + 7);
    });

    it("uses provided YEARS_BACK", () => {
      const config = getConfig({ YEARS_BACK: "5" });
      expect(config.startYear).toBe(currentYear - 5);
      expect(config.endYear).toBe(currentYear + 7);
    });

    it("uses provided YEARS_FORWARD", () => {
      const config = getConfig({ YEARS_FORWARD: "10" });
      expect(config.startYear).toBe(currentYear - 3);
      expect(config.endYear).toBe(currentYear + 10);
    });

    it("uses both env vars when provided", () => {
      const config = getConfig({ YEARS_BACK: "1", YEARS_FORWARD: "2" });
      expect(config.startYear).toBe(currentYear - 1);
      expect(config.endYear).toBe(currentYear + 2);
    });

    it("handles zero values", () => {
      const config = getConfig({ YEARS_BACK: "0", YEARS_FORWARD: "0" });
      expect(config.startYear).toBe(currentYear);
      expect(config.endYear).toBe(currentYear);
    });
  });

  describe("includeSundays", () => {
    it("defaults to false", () => {
      expect(getConfig({}).includeSundays).toBe(false);
    });

    it("parses 'true'", () => {
      expect(getConfig({ INCLUDE_SUNDAYS: "true" }).includeSundays).toBe(true);
    });

    it("parses '1'", () => {
      expect(getConfig({ INCLUDE_SUNDAYS: "1" }).includeSundays).toBe(true);
    });

    it("parses 'false'", () => {
      expect(getConfig({ INCLUDE_SUNDAYS: "false" }).includeSundays).toBe(false);
    });

    it("treats other values as false", () => {
      expect(getConfig({ INCLUDE_SUNDAYS: "yes" }).includeSundays).toBe(false);
    });
  });

  describe("skipWeekends", () => {
    it("defaults to false", () => {
      expect(getConfig({}).skipWeekends).toBe(false);
    });

    it("parses 'true'", () => {
      expect(getConfig({ SKIP_WEEKENDS: "true" }).skipWeekends).toBe(true);
    });

    it("parses '1'", () => {
      expect(getConfig({ SKIP_WEEKENDS: "1" }).skipWeekends).toBe(true);
    });
  });

  describe("lang", () => {
    it("defaults to 'both'", () => {
      expect(getConfig({}).lang).toBe("both");
    });

    it("accepts 'english' (case-insensitive)", () => {
      expect(getConfig({ LANG: "English" }).lang).toBe("english");
      expect(getConfig({ LANG: "ENGLISH" }).lang).toBe("english");
    });

    it("accepts 'swedish' (case-insensitive)", () => {
      expect(getConfig({ LANG: "Swedish" }).lang).toBe("swedish");
      expect(getConfig({ LANG: "SWEDISH" }).lang).toBe("swedish");
    });

    it("accepts 'both' (case-insensitive)", () => {
      expect(getConfig({ LANG: "Both" }).lang).toBe("both");
    });

    it("falls back to 'both' for unknown values", () => {
      expect(getConfig({ LANG: "german" }).lang).toBe("both");
    });
  });

  describe("query parameter overrides", () => {
    function query(params: Record<string, string>): URLSearchParams {
      return new URLSearchParams(params);
    }

    it("overrides years_back from query", () => {
      const config = getConfig({ YEARS_BACK: "3" }, query({ years_back: "1" }));
      expect(config.startYear).toBe(currentYear - 1);
    });

    it("overrides years_forward from query", () => {
      const config = getConfig({ YEARS_FORWARD: "7" }, query({ years_forward: "2" }));
      expect(config.endYear).toBe(currentYear + 2);
    });

    it("overrides include_sundays from query", () => {
      const config = getConfig({ INCLUDE_SUNDAYS: "false" }, query({ include_sundays: "true" }));
      expect(config.includeSundays).toBe(true);
    });

    it("overrides skip_weekends from query", () => {
      const config = getConfig({}, query({ skip_weekends: "1" }));
      expect(config.skipWeekends).toBe(true);
    });

    it("overrides lang from query", () => {
      const config = getConfig({ LANG: "both" }, query({ lang: "swedish" }));
      expect(config.lang).toBe("swedish");
    });

    it("falls back to env when query param is absent", () => {
      const config = getConfig({ LANG: "english" }, query({}));
      expect(config.lang).toBe("english");
    });

    it("falls back to defaults when both env and query are absent", () => {
      const config = getConfig({}, query({}));
      expect(config.lang).toBe("both");
      expect(config.includeSundays).toBe(false);
    });

    it("treats valueless boolean query params as true", () => {
      const params = new URLSearchParams("include_sundays&skip_weekends");
      const config = getConfig({}, params);
      expect(config.includeSundays).toBe(true);
      expect(config.skipWeekends).toBe(true);
    });
  });
});
