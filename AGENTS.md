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

## Public API Rules

- The Worker is public at `https://swedish-red-days.me-cloudflare-447.workers.dev/`.
- Query params override environment variables.
- `lang` is permissive: unsupported values fall back to `both`.
- `years_back` and `years_forward` are strict public inputs: they must be integers in `0..25`.
- Invalid `years_back` or `years_forward` values must return `400 Bad Request`, not silently fall
  back.
- Boolean query params may be valueless, for example `?skip_weekends`.

## Behavior Expectations

- Holiday output must be chronologically ordered before iCal generation.
- `SKIP_WEEKENDS` supersedes `INCLUDE_SUNDAYS`.
- Avoid changing holiday names or date rules without updating tests and README examples.

## Working Rules

- Update co-located tests with every behavior change.
- Run `pnpm run lint`, `pnpm run typecheck`, and `pnpm test` before considering work complete.
- Keep `README.md` in sync with the public API, deployment URL, and configuration behavior.
- Keep release-facing docs such as `COPYING.md`, `CHANGELOG.md`, and `.dev.vars.example` in sync
  when relevant.
- Do not edit generated or dependency directories such as `.wrangler/` or `node_modules/`.
- Ignore unrelated local changes unless the task explicitly requires them.
