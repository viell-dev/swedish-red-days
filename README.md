# Swedish Red Days

A Cloudflare Worker that serves a subscribable iCal calendar of Swedish public holidays (_allmänna
helgdagar_). In Sweden these are colloquially known as "red days" (_röda dagar_) after their
traditional color on printed calendars. The calendar dynamically generates events for a configurable
range of years around the current date.

The holidays follow [Lag (1989:253) om allmänna helgdagar](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1989253-om-allmanna-helgdagar_sfs-1989-253/),
including its historical amendment: see [Historical Accuracy](#historical-accuracy) below.

Current live URL: `https://swedish-red-days.me-cloudflare-447.workers.dev/`

## Included Holidays

| Swedish Name           | English Name            | Date                          |
| ---------------------- | ----------------------- | ----------------------------- |
| Nyårsdagen             | New Year's Day          | January 1                     |
| Trettondedag jul       | Epiphany                | January 6                     |
| Långfredagen           | Good Friday             | Easter − 2 days               |
| Påskdagen              | Easter Sunday           | Calculated annually           |
| Annandag påsk          | Easter Monday           | Easter + 1 day                |
| Första maj             | May Day                 | May 1                         |
| Kristi himmelsfärdsdag | Ascension Day           | Easter + 39 days              |
| Pingstdagen            | Whit Sunday             | Easter + 49 days              |
| Annandag pingst        | Whit Monday             | Easter + 50 days (until 2004) |
| Sveriges nationaldag   | National Day            | June 6 (from 2005)            |
| Midsommardagen         | Midsummer Day           | Saturday between Jun 20–26    |
| Alla helgons dag       | All Saints' Day         | Saturday between Oct 31–Nov 6 |
| Juldagen               | Christmas Day           | December 25                   |
| Annandag jul           | Second Day of Christmas | December 26                   |

Easter is calculated using the Anonymous Gregorian algorithm (Meeus/Jones/Butcher). The date rules
for every holiday are explained in [docs/holiday-math.md](docs/holiday-math.md).

## Historical Accuracy

Sweden's National Day became a public holiday in 2005, replacing Whit Monday (SFS 2004:1320). The
calendar applies this boundary exactly: requested years up to and including 2004 contain Whit
Monday and no National Day, years from 2005 the reverse. Every year the API can emit uses the
holiday rules that were legally in force that year. See
[docs/legal-background.md](docs/legal-background.md) for the full legal history.

## Prerequisites

- [Node.js](https://nodejs.org/) 24+
- [pnpm](https://pnpm.io/)

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm run dev
```

This starts a local Wrangler dev server. The calendar is served at `http://localhost:8787`.

## Testing

```sh
pnpm test
pnpm run typecheck
pnpm run lint
```

## Deployment

Production deploys automatically from the GitHub `main` branch through Cloudflare's GitHub
integration.

If you need to deploy manually, authenticate Wrangler with Cloudflare and ensure the Worker name
and vars in `wrangler.jsonc` match the target account:

```sh
pnpm exec wrangler login
pnpm run deploy
```

After deployment, verify the response in a browser or with a calendar client against:

```text
https://swedish-red-days.me-cloudflare-447.workers.dev/
```

A scheduled workflow verifies the live endpoint weekly, so a broken deployment does not go
unnoticed between releases.

## Configuration

| Variable          | Default | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| `YEARS_BACK`      | `1`     | How many years before the current year             |
| `YEARS_FORWARD`   | `5`     | How many years after the current year              |
| `INCLUDE_SUNDAYS` | `false` | Include every Sunday as a red day                  |
| `SKIP_WEEKENDS`   | `false` | Exclude holidays that fall on a Saturday or Sunday |
| `LANG`            | `both`  | Event names: `english`, `swedish`, or `both`       |

The year range is relative to the current year in Sweden (`Europe/Stockholm`), so `YEARS_BACK=1`
and `YEARS_FORWARD=5` produce a seven-year calendar centered near today.

Defaults are set in `wrangler.jsonc` under `vars`. For local overrides during development, create
a `.dev.vars` file:

```
YEARS_BACK=5
YEARS_FORWARD=10
LANG=swedish
```

You can copy `.dev.vars.example` as a starting point.

## API Contract

Every setting can also be overridden per-request via query parameters (lowercase,
underscore-separated), so different subscription URLs give different filtered calendars:

```
https://swedish-red-days.me-cloudflare-447.workers.dev/?lang=english&skip_weekends&years_back=1
```

The contract:

- Query parameters take precedence over environment variables, which take precedence over
  built-in defaults.
- `years_back` and `years_forward` must be integers in `0..25`. Any other value (including empty,
  negative, or fractional) returns `400 Bad Request` with a plain-text error naming the parameter:

  ```text
  https://swedish-red-days.me-cloudflare-447.workers.dev/?years_back=1.5
  ```

- `lang` accepts `english`, `swedish`, or `both` (case-insensitive); any other value falls back to
  `both`.
- Boolean parameters treat valueless (`?skip_weekends`), `true`, and `1` as true; anything else is
  false.
- `skip_weekends` supersedes `include_sundays` — when weekends are skipped, Sundays are never
  included.
- Successful responses are `text/calendar; charset=utf-8` with
  `Cache-Control: public, max-age=86400`, so results may be up to a day old.
- Events are all-day events with stable UIDs derived from date and holiday name, so calendar
  clients update events across refreshes instead of duplicating them.

## Calendar Subscription

Once deployed, use the Worker URL as a calendar subscription in your calendar app:

- **Apple Calendar:** File → New Calendar Subscription → paste the URL
- **Google Calendar:** Other calendars (+) → From URL → paste the URL
- **Outlook:** Add calendar → Subscribe from web → paste the URL

The calendar refreshes based on each client's polling interval (typically every few hours to once a
day).

## License

This project is licensed under GPLv3 only. See [`COPYING.md`](COPYING.md).

## Changelog

Release notes live in [`CHANGELOG.md`](CHANGELOG.md).
