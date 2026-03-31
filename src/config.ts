import { Temporal } from "temporal-polyfill";

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

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "";
}

function parseLang(value: string | undefined): Lang {
  const normalized = value?.toLowerCase();
  if (normalized === "english" || normalized === "swedish") return normalized;
  return "both";
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
  const yearsBack = parseInt(resolve(query, env.YEARS_BACK, "years_back") ?? "3", 10);
  const yearsForward = parseInt(resolve(query, env.YEARS_FORWARD, "years_forward") ?? "7", 10);

  return {
    startYear: currentYear - yearsBack,
    endYear: currentYear + yearsForward,
    includeSundays: parseBool(resolve(query, env.INCLUDE_SUNDAYS, "include_sundays"), false),
    skipWeekends: parseBool(resolve(query, env.SKIP_WEEKENDS, "skip_weekends"), false),
    lang: parseLang(resolve(query, env.LANG, "lang")),
  };
}
