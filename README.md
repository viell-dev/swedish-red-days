# Swedish Red Days

A Cloudflare Worker that serves a subscribable iCal calendar of Swedish public holidays (_allmänna
helgdagar_). In Sweden these are colloquially known as "red days" (_röda dagar_) after their
traditional color on printed calendars. The calendar dynamically generates events for a configurable
range of years around the current date.

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

If a custom domain is added later, the Worker URL remains a valid fallback endpoint.

## Configuration

| Variable          | Default | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| `YEARS_BACK`      | `1`     | How many years before the current year             |
| `YEARS_FORWARD`   | `5`     | How many years after the current year              |
| `INCLUDE_SUNDAYS` | `false` | Include every Sunday as a red day                  |
| `SKIP_WEEKENDS`   | `false` | Exclude holidays that fall on a Saturday or Sunday |
| `LANG`            | `both`  | Event names: `english`, `swedish`, or `both`       |

Booleans accept `true`/`1`/no value for true, anything else is false (no value applies to query
parameters only, e.g. `?skip_weekends`). `SKIP_WEEKENDS` supersedes `INCLUDE_SUNDAYS` when weekends
are skipped, Sundays are never included.

`YEARS_BACK` and `YEARS_FORWARD` must be integers in the range `0..25`. Invalid values return
`400 Bad Request`.

Defaults are set in `wrangler.jsonc` under `vars`. For local overrides, create a `.dev.vars` file:

```
YEARS_BACK=5
YEARS_FORWARD=10
LANG=swedish
```

You can copy `.dev.vars.example` as a starting point.

All settings can also be overridden per-request via query parameters (lowercase,
underscore-separated):

```
https://swedish-red-days.me-cloudflare-447.workers.dev/?lang=english&skip_weekends&years_back=1
```

That means you can subscribe to different filtered calendars by using different subscription URLs.

Example invalid request:

```text
https://swedish-red-days.me-cloudflare-447.workers.dev/?years_back=1.5
```

This returns `400 Bad Request`.

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

## Linting & Formatting

```sh
pnpm run lint          # oxlint + eslint
pnpm run typecheck     # tsc --noEmit
pnpm run format        # prettier --write
```
