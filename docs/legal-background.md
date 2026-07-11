# Legal Background

What makes a day "red" in Sweden, and which legal changes this service models. The date math
itself is covered in [holiday-math.md](holiday-math.md).

## The Governing Law

Swedish public holidays (_allmänna helgdagar_) are defined by
[Lag (1989:253) om allmänna helgdagar](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1989253-om-allmanna-helgdagar_sfs-1989-253/).
The law is two short paragraphs:

1. The first paragraph lists the public holidays: Sundays (explicitly including Easter Sunday and
   Whit Sunday), plus New Year's Day, Epiphany, May Day, Christmas Day, and Second Day of
   Christmas even when they do not fall on a Sunday, plus Good Friday, Easter Monday, Ascension
   Day, National Day, Midsummer Day, and All Saints' Day.
2. The second paragraph fixes the dates: New Year's Day January 1, Epiphany January 6, May Day
   May 1, National Day June 6, Christmas Day December 25, Second Day of Christmas December 26;
   Easter Sunday as the Sunday after the full moon on or after March 21; Good Friday, Easter
   Monday, Ascension Day, and Whit Sunday relative to Easter; Midsummer Day as the Saturday in
   June 20–26; All Saints' Day as the Saturday in October 31 – November 6.

Because Sundays are themselves public holidays, Easter Sunday and Whit Sunday are red days by two
routes at once. This is why the optional `include_sundays` mode deduplicates them.

## SFS 2004:1320 — National Day Replaces Whit Monday

The only amendment to the 1989 law is
[SFS 2004:1320](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/nationaldagen-ny-helgdag_gs01ku6/),
decided by the Riksdag on December 1, 2004 and in force January 1, 2005:

- **Added:** Sweden's National Day (Sveriges nationaldag, June 6) as a public holiday.
- **Removed:** Whit Monday (Annandag pingst, the day after Whit Sunday).

Whit Monday was therefore a public holiday through 2004, and National Day has been one from 2005.
The churches consulted during the inquiry ([SOU 2004:45](https://www.regeringen.se/contentassets/5dd47cb464cb4df8876555bac45e0c3f/nationaldagen---ny-helgdag/))
agreed Whit Monday was the least harmful church holiday to give up. The swap was not
work-time-neutral: Whit Monday always falls on a Monday while June 6 falls on a weekend two years
in seven, which is also why `skip_weekends` can remove National Day but never removed Whit Monday.

This service applies the boundary exactly: requested years up to and including 2004 include Whit
Monday and exclude National Day; years from 2005 do the reverse.

## The 1953 Calendar Reform

The oldest rules this service relies on date from the reform decided by the Riksdag in February
1952, effective 1953:

- Midsummer Day moved from a fixed June 24 to the Saturday between June 20 and 26.
- All Saints' Day became a public holiday on the Saturday between October 31 and November 6.
- The Annunciation (Marie bebådelsedag, March 25) stopped being its own public holiday.

Because `MAX_YEAR_OFFSET` caps the range at 25 years back, the service can never emit a year
before 1953-era rules apply, so no earlier legal history needs to be modeled.

## Deliberately Out of Scope

Several culturally red-ish days are **not** allmänna helgdagar and are intentionally excluded:

- **Eves** — Midsummer Eve, Christmas Eve, and New Year's Eve are de facto days off for most
  workers (and are equated with holidays in some statutes and collective agreements), but they are
  not public holidays under the 1989 law.
- **Flag days** (allmänna flaggdagar) — a separate list regulated by its own ordinance; most flag
  days are ordinary working days.
- **Half-days and squeeze days** (klämdagar) — collective-agreement territory, not law.

If Swedish public holiday law changes again, `src/holidays/swedish-red-days.ts` and this document
are the places to update.

## Sources

- [Lag (1989:253) om allmänna helgdagar — Riksdagen](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1989253-om-allmanna-helgdagar_sfs-1989-253/)
- [Nationaldagen — ny helgdag, betänkande 2004/05:KU6 — Riksdagen](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/nationaldagen-ny-helgdag_gs01ku6/)
- [Prop. 2004/05:23 Nationaldagen den 6 juni som allmän helgdag — Riksdagen](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/nationaldagen-den-6-juni-som-allman-helgdag_gs0323/html/)
- [SOU 2004:45 Nationaldagen — ny helgdag — Regeringen](https://www.regeringen.se/contentassets/5dd47cb464cb4df8876555bac45e0c3f/nationaldagen---ny-helgdag/)
- [Vad innebar kalenderreformen 1953? — Högtider och traditioner](https://svenskahogtider.com/2013/02/15/vad-innebar-kalenderreformen-1953/)
