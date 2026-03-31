import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";
import { ConfigError, MAX_YEAR_OFFSET, getConfig } from "./config.js";

const currentYear = Temporal.Now.plainDateISO().year;

describe("getConfig", () => {
  describe("year range", () => {
    it("uses default values when env vars are not set", () => {
      const config = getConfig({});
      expect(config.startYear).toBe(currentYear - 1);
      expect(config.endYear).toBe(currentYear + 5);
    });

    it("uses provided YEARS_BACK", () => {
      const config = getConfig({ YEARS_BACK: "5" });
      expect(config.startYear).toBe(currentYear - 5);
      expect(config.endYear).toBe(currentYear + 5);
    });

    it("uses provided YEARS_FORWARD", () => {
      const config = getConfig({ YEARS_FORWARD: "10" });
      expect(config.startYear).toBe(currentYear - 1);
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

    it("accepts the maximum supported values", () => {
      const config = getConfig({
        YEARS_BACK: String(MAX_YEAR_OFFSET),
        YEARS_FORWARD: String(MAX_YEAR_OFFSET),
      });
      expect(config.startYear).toBe(currentYear - MAX_YEAR_OFFSET);
      expect(config.endYear).toBe(currentYear + MAX_YEAR_OFFSET);
    });

    it.each([
      { key: "YEARS_BACK", value: "abc" },
      { key: "YEARS_BACK", value: "10abc" },
      { key: "YEARS_BACK", value: "-1" },
      { key: "YEARS_BACK", value: "1.5" },
      { key: "YEARS_BACK", value: "" },
      { key: "YEARS_BACK", value: String(MAX_YEAR_OFFSET + 1) },
      { key: "YEARS_FORWARD", value: "abc" },
      { key: "YEARS_FORWARD", value: "10abc" },
      { key: "YEARS_FORWARD", value: "-1" },
      { key: "YEARS_FORWARD", value: "1.5" },
      { key: "YEARS_FORWARD", value: "" },
      { key: "YEARS_FORWARD", value: String(MAX_YEAR_OFFSET + 1) },
    ])("rejects invalid $key value '$value'", ({ key, value }) => {
      expect(() => getConfig({ [key]: value })).toThrowError(ConfigError);
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

    it("uses a valid query value even when the env value is invalid", () => {
      const config = getConfig({ YEARS_BACK: "invalid" }, query({ years_back: "2" }));
      expect(config.startYear).toBe(currentYear - 2);
    });

    it("rejects an invalid query value even when the env value is valid", () => {
      expect(() => getConfig({ YEARS_BACK: "2" }, query({ years_back: "invalid" }))).toThrowError(
        ConfigError,
      );
    });

    it("rejects invalid numeric query parameters", () => {
      expect(() => getConfig({}, query({ years_forward: "1.5" }))).toThrowError(ConfigError);
      expect(() => getConfig({}, query({ years_back: String(MAX_YEAR_OFFSET + 1) }))).toThrowError(
        ConfigError,
      );
    });
  });
});
