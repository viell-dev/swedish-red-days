# Swedish Red Days

A Cloudflare Worker that serves a subscribable iCal calendar of Swedish public holidays (_allmänna
helgdagar_). In Sweden these are colloquially known as "red days" (_röda dagar_) after their
traditional color on printed calendars. The calendar dynamically generates events for a configurable
range of years around the current date.

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
| Sveriges nationaldag   | National Day            | June 6                        |
| Midsommardagen         | Midsummer Day           | Saturday between Jun 20–26    |
| Alla helgons dag       | All Saints' Day         | Saturday between Oct 31–Nov 6 |
| Juldagen               | Christmas Day           | December 25                   |
| Annandag jul           | Second Day of Christmas | December 26                   |

Easter is calculated using the Anonymous Gregorian algorithm (Meeus/Jones/Butcher).

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

## Deployment

```sh
pnpm run deploy
```

## Configuration

| Variable          | Default | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| `YEARS_BACK`      | `3`     | How many years before the current year             |
| `YEARS_FORWARD`   | `7`     | How many years after the current year              |
| `INCLUDE_SUNDAYS` | `false` | Include every Sunday as a red day                  |
| `SKIP_WEEKENDS`   | `false` | Exclude holidays that fall on a Saturday or Sunday |
| `LANG`            | `both`  | Event names: `english`, `swedish`, or `both`       |

Booleans accept `true`/`1`/no value for true, anything else is false (no value applies to query
parameters only, e.g. `?skip_weekends`). `SKIP_WEEKENDS` supersedes `INCLUDE_SUNDAYS` when weekends
are skipped, Sundays are never included.

Defaults are set in `wrangler.jsonc` under `vars`. For local overrides, create a `.dev.vars` file:

```
YEARS_BACK=5
YEARS_FORWARD=10
LANG=swedish
```

All settings can also be overridden per-request via query parameters (lowercase,
underscore-separated):

```
https://your-worker.workers.dev/?lang=english&skip_weekends&years_back=1
```

## Calendar Subscription

Once deployed, use the Worker URL as a calendar subscription in your calendar app:

- **Apple Calendar:** File → New Calendar Subscription → paste the URL
- **Google Calendar:** Other calendars (+) → From URL → paste the URL
- **Outlook:** Add calendar → Subscribe from web → paste the URL

The calendar refreshes based on each client's polling interval (typically every few hours to once a
day).

## Linting & Formatting

```sh
pnpm run lint          # oxlint + eslint
pnpm run format        # prettier --write
```
