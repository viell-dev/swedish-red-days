# Swedish Red Days — Repository

See [README.md](README.md) for project description, holidays list, setup, and usage.

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Language:** TypeScript (strict, ESNext)
- **Date handling:** `temporal-polyfill` (TC39 Temporal API)
- **iCal generation:** `ical-generator`
- **Package manager:** pnpm
- **Bundler:** Wrangler (Cloudflare's bundler for Workers)

## Code Layout

```
src/
  main.ts               # Worker entry point (fetch handler)
  config.ts             # Env type + year range from YEARS_BACK/YEARS_FORWARD
  holidays/
    types.ts            # Holiday interface
    easter.ts           # Easter Sunday via Anonymous Gregorian algorithm
    swedish-red-days.ts # All 13 Swedish public holidays per year
  calendar/
    ical.ts             # Converts Holiday[] to iCal string
```

Test files are co-located with their source files as `*.test.ts`.

## Conventions

- Linting: oxlint runs first (fast), then eslint with oxlint-covered and prettier-covered rules
  disabled.
- Prettier: all defaults except `printWidth: 100`.
- All source imports use `.js` extensions (ESM).
- Holiday dates use `Temporal.PlainDate`, converted to `Date` only at the iCal boundary.
