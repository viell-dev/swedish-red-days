import { buildCalendar } from "./calendar/ical.js";
import { getConfig, type Env } from "./config.js";
import { getSwedishRedDaysForRange } from "./holidays/swedish-red-days.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const query = new URL(request.url).searchParams;
    const config = getConfig(env, query);
    const holidays = getSwedishRedDaysForRange(config.startYear, config.endYear, {
      includeSundays: config.includeSundays,
      skipWeekends: config.skipWeekends,
    });
    const calendarData = buildCalendar(holidays, config.lang);

    return new Response(calendarData, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="swedish-red-days.ics"',
        "Cache-Control": "public, max-age=86400",
      },
    });
  },
} satisfies ExportedHandler<Env>;
