import { describe, expect, it } from "vitest";
import worker from "./main.js";
import type { Env } from "./config.js";

describe("worker fetch", () => {
  async function fetchCalendar(url: string, env: Env = {}): Promise<Response> {
    return worker.fetch(new Request(url), env);
  }

  it("returns a calendar response by default", async () => {
    const response = await fetchCalendar("https://example.com/");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/calendar; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="swedish-red-days.ics"',
    );
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("END:VCALENDAR");
  });

  it("applies query parameter overrides through the fetch handler", async () => {
    const response = await fetchCalendar(
      "https://example.com/?lang=english&include_sundays&years_back=0&years_forward=0",
      {
        INCLUDE_SUNDAYS: "false",
        LANG: "swedish",
        YEARS_BACK: "3",
        YEARS_FORWARD: "7",
      },
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("NAME:Swedish Red Days");
    expect(body).toContain("SUMMARY:Sunday");
    expect(body).not.toContain("Svenska röda dagar");
  });

  it("returns 400 for invalid numeric query parameters", async () => {
    const response = await fetchCalendar("https://example.com/?years_back=not-a-number");

    expect(response.status).toBe(400);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    await expect(response.text()).resolves.toContain("years_back");
  });

  it("returns 400 for numeric values above the supported range", async () => {
    const response = await fetchCalendar("https://example.com/?years_forward=26");

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain("years_forward");
  });
});
