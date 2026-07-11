# Holiday Date Math

How each Swedish public holiday's date is computed, and why the math is trustworthy. The
implementation lives in `src/holidays/swedish-red-days.ts` and `src/holidays/easter.ts`.

## Fixed-Date Holidays

These fall on the same calendar date every year and need no computation:

| Holiday                                | Date        | Notes                                |
| -------------------------------------- | ----------- | ------------------------------------ |
| New Year's Day (Nyårsdagen)            | January 1   |                                      |
| Epiphany (Trettondedag jul)            | January 6   |                                      |
| May Day (Första maj)                   | May 1       |                                      |
| National Day (Sveriges nationaldag)    | June 6      | Public holiday from 2005 (see below) |
| Christmas Day (Juldagen)               | December 25 |                                      |
| Second Day of Christmas (Annandag jul) | December 26 |                                      |

## Easter-Relative Holidays

Everything else in the movable block is an offset from Easter Sunday:

| Holiday                                | Offset      | Law definition                                          |
| -------------------------------------- | ----------- | ------------------------------------------------------- |
| Good Friday (Långfredagen)             | Easter − 2  | Friday before Easter Sunday                             |
| Easter Sunday (Påskdagen)              | Easter      | See computus below                                      |
| Easter Monday (Annandag påsk)          | Easter + 1  | Day after Easter Sunday                                 |
| Ascension Day (Kristi himmelsfärdsdag) | Easter + 39 | Sixth Thursday after Easter Sunday                      |
| Whit Sunday (Pingstdagen)              | Easter + 49 | Seventh Sunday after Easter Sunday                      |
| Whit Monday (Annandag pingst)          | Easter + 50 | Day after Whit Sunday; public holiday through 2004 only |

The offsets follow directly from the day-of-week definitions: Easter Sunday is a Sunday, so the
first Thursday after it is +4 days and the sixth is +4 + 5×7 = +39; the first Sunday after it is
+7 days and the seventh is +49.

Whit Monday and National Day are mutually exclusive: years up to and including 2004 get Whit
Monday, years from 2005 get National Day. See [legal-background.md](legal-background.md).

## Saturday-Anchored Holidays

Two holidays are defined as "the Saturday within a window" (rules in force since 1953):

| Holiday                            | Window                  |
| ---------------------------------- | ----------------------- |
| Midsummer Day (Midsommardagen)     | June 20 – June 26       |
| All Saints' Day (Alla helgons dag) | October 31 – November 6 |

Both windows are exactly seven days, so they always contain exactly one Saturday. The
implementation finds the next Saturday on or after the window start:

```text
daysUntilSaturday = (6 − dayOfWeek + 7) mod 7
```

Temporal numbers weekdays 1 (Monday) through 7 (Sunday), so `6 − dayOfWeek` is the signed distance
to Saturday; adding 7 before the modulo keeps the result in `0..6`. If the window start is itself
a Saturday the offset is 0.

## Easter Computus

Easter Sunday is computed with the Anonymous Gregorian algorithm (also known as
Meeus/Jones/Butcher). It is a pure integer arithmetic condensation of the Gregorian calendar
reform's Easter rules: Easter is the Sunday after the first ecclesiastical full moon on or after
March 21. The ecclesiastical moon is a lookup-table approximation of the real moon, so no
astronomy is involved — the algorithm reproduces the table.

The implementation in `src/holidays/easter.ts` uses descriptive names instead of the traditional
single letters:

| Variable                | Traditional  | Meaning                                              |
| ----------------------- | ------------ | ---------------------------------------------------- |
| `century`               | b (÷100)     | Gregorian century number                             |
| `metonicCyclePosition`  | a            | Year's position in the 19-year Metonic moon cycle    |
| `leapCenturyCorrection` | (part of g)  | Correction for the 25-century lunar drift adjustment |
| `paschalFullMoonOffset` | h (adjusted) | Days from March 21 to the ecclesiastical full moon   |
| `weekdayCorrection`     | l            | Days from the full moon to the following Sunday      |
| `daysFromEquinox`       | h − l        | Combined offset used to derive month and day         |

The two extra reductions applied to `paschalFullMoonOffset` handle the algorithm's classic corner
cases: a computed full moon of April 19 is pulled back to April 18, and April 18 is pulled back to
April 17 for years late in the Metonic cycle. These keep Easter within its legal bounds of
March 22 through April 25.

### Validity

- The algorithm is exact for all years in the Gregorian calendar (1583 onward), with no upper
  limit; it is not valid for the Julian calendar.
- This implementation was cross-checked against an independently written, textbook-form
  Meeus/Jones/Butcher implementation for every year 1583–3000 with zero mismatches, including the
  extreme dates (April 25 in 1943 and 2038, March 22 in 2285).
- `src/holidays/easter.test.ts` pins fifteen known Easter dates and verifies the
  Sunday/March-or-April invariants across 2000–2050.

One historical caveat: Sweden used astronomically computed Easter dates between 1740 and 1844,
which differ from the Gregorian computus in a handful of years. That era is far outside the range
this service can emit (see `MAX_YEAR_OFFSET` in `src/config.ts`), so it is intentionally ignored.

## Sundays

With `include_sundays` enabled, every Sunday of each year is emitted as a red day (Sundays are
public holidays under the law). The generator starts at January 1, advances
`(7 − dayOfWeek) mod 7` days to reach the first Sunday, then steps in 7-day increments while the
year matches. Sundays that coincide with a named holiday (always Easter Sunday and Whit Sunday)
are deduplicated by date, with the named holiday winning.

## Year Range Safety

`MAX_YEAR_OFFSET` is 25, so the earliest year the API can ever emit is the current year minus 25.
All rules implemented here are accurate from 1953 onward (the Saturday-anchored rules are the
youngest pre-2005 rules), and 25 years back could only reach 1952 if the current year were 1977.
The rules therefore hold for every reachable year, past and future, unless the law changes again.
