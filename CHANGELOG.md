# Changelog

## 0.1.0

- Initial public release of the Cloudflare Worker.
- Generates a subscribable iCal calendar for Swedish public holidays.
- Supports configurable year ranges, optional Sunday inclusion, weekend filtering, and English,
  Swedish, or bilingual event names.
- Validates `years_back` and `years_forward` as integers in `0..25` and returns `400 Bad Request`
  for invalid values.
