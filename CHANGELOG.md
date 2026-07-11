# Changelog

## 1.0.0

- Applies the historically correct holiday rules per year: Whit Monday (Annandag pingst) through
  2004, National Day (Sveriges nationaldag) from 2005 (SFS 2004:1320).
- Anchors the year range to the current year in Sweden (`Europe/Stockholm`) instead of UTC.
- Adds stable iCal event UIDs derived from date and holiday name, so calendar clients update
  events across subscription refreshes instead of duplicating them.
- Adds a weekly scheduled smoke check of the live endpoint.
- Adds documentation of the holiday date math and the legal background under `docs/`.
- Refreshes all dependencies (ical-generator 11, temporal-polyfill 1.0, ESLint 10, TypeScript 6)
  with a clean security audit at all severity levels.
- Hardens the test suite: 2004/2005 boundary tests, iCal structure and golden snapshot tests, and
  a `tests/` directory mirroring `src/`.

## 0.1.0

- Initial public release of the Cloudflare Worker.
- Generates a subscribable iCal calendar for Swedish public holidays.
- Supports configurable year ranges, optional Sunday inclusion, weekend filtering, and English,
  Swedish, or bilingual event names.
- Validates `years_back` and `years_forward` as integers in `0..25` and returns `400 Bad Request`
  for invalid values.
