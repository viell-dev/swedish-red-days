import { Temporal } from "temporal-polyfill";

/**
 * Calculates Easter Sunday for a given year using the Anonymous Gregorian algorithm
 * (also known as the Meeus/Jones/Butcher algorithm).
 *
 * @see https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
 * @see https://www.irt.org/articles/js052/index.htm
 */
export function getEasterSunday(year: number): Temporal.PlainDate {
  const century = Math.floor(year / 100);
  const metonicCyclePosition = year - 19 * Math.floor(year / 19);
  const leapCenturyCorrection = Math.floor((century - 17) / 25);

  let paschalFullMoonOffset =
    century -
    Math.floor(century / 4) -
    Math.floor((century - leapCenturyCorrection) / 3) +
    19 * metonicCyclePosition +
    15;
  paschalFullMoonOffset = paschalFullMoonOffset - 30 * Math.floor(paschalFullMoonOffset / 30);
  paschalFullMoonOffset =
    paschalFullMoonOffset -
    Math.floor(paschalFullMoonOffset / 28) *
      (1 -
        Math.floor(paschalFullMoonOffset / 28) *
          Math.floor(29 / (paschalFullMoonOffset + 1)) *
          Math.floor((21 - metonicCyclePosition) / 11));

  let weekdayCorrection =
    year + Math.floor(year / 4) + paschalFullMoonOffset + 2 - century + Math.floor(century / 4);
  weekdayCorrection = weekdayCorrection - 7 * Math.floor(weekdayCorrection / 7);

  const daysFromEquinox = paschalFullMoonOffset - weekdayCorrection;
  const easterMonth = 3 + Math.floor((daysFromEquinox + 40) / 44);
  const easterDay = daysFromEquinox + 28 - 31 * Math.floor(easterMonth / 4);

  return new Temporal.PlainDate(year, easterMonth, easterDay);
}
