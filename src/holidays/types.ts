import type { Temporal } from "temporal-polyfill";

export interface Holiday {
  /** English name, e.g. "Good Friday" */
  name: string;
  /** Swedish name, e.g. "Långfredagen" */
  swedishName: string;
  /** Date of the holiday */
  date: Temporal.PlainDate;
}
