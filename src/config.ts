import { Temporal } from "temporal-polyfill";

export const DEFAULT_YEARS_BACK = 1;
export const DEFAULT_YEARS_FORWARD = 5;
export const MAX_YEAR_OFFSET = 25;

export interface Env {
  YEARS_BACK?: string;
  YEARS_FORWARD?: string;
  INCLUDE_SUNDAYS?: string;
  SKIP_WEEKENDS?: string;
  LANG?: string;
}

export type Lang = "english" | "swedish" | "both";

export interface Config {
  startYear: number;
  endYear: number;
  includeSundays: boolean;
  skipWeekends: boolean;
  lang: Lang;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "";
}

function parseLang(value: string | undefined): Lang {
  const normalized = value?.toLowerCase();
  if (normalized === "english" || normalized === "swedish") return normalized;
  return "both";
}

function parseYearOffset(value: string | undefined, key: string, fallback: number): number {
  if (value === undefined) return fallback;

  if (!/^\d+$/.test(value)) {
    throw new ConfigError(`Invalid ${key}: expected an integer between 0 and ${MAX_YEAR_OFFSET}.`);
  }

  const parsedValue = Number(value);
  if (parsedValue > MAX_YEAR_OFFSET) {
    throw new ConfigError(`Invalid ${key}: expected an integer between 0 and ${MAX_YEAR_OFFSET}.`);
  }

  return parsedValue;
}

/** Resolve a setting: query param takes precedence over env var. */
function resolve(
  query: URLSearchParams,
  envValue: string | undefined,
  key: string,
): string | undefined {
  return query.get(key) ?? envValue;
}

export function getConfig(env: Env, query: URLSearchParams = new URLSearchParams()): Config {
  const currentYear = Temporal.Now.plainDateISO().year;
  const yearsBack = parseYearOffset(
    resolve(query, env.YEARS_BACK, "years_back"),
    "years_back",
    DEFAULT_YEARS_BACK,
  );
  const yearsForward = parseYearOffset(
    resolve(query, env.YEARS_FORWARD, "years_forward"),
    "years_forward",
    DEFAULT_YEARS_FORWARD,
  );

  return {
    startYear: currentYear - yearsBack,
    endYear: currentYear + yearsForward,
    includeSundays: parseBool(resolve(query, env.INCLUDE_SUNDAYS, "include_sundays"), false),
    skipWeekends: parseBool(resolve(query, env.SKIP_WEEKENDS, "skip_weekends"), false),
    lang: parseLang(resolve(query, env.LANG, "lang")),
  };
}
