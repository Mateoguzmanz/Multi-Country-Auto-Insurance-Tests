/**
 * Parses a date-only string (`YYYY-MM-DD`, as produced by a native `<input type="date">`)
 * as local midnight. `new Date('YYYY-MM-DD')` parses the string as UTC midnight, which, read
 * back with local getters, silently shifts the calendar date one day backward in any
 * timezone behind UTC — including Colombia and Chile, this project's own target countries.
 * Falls back to the native parser for anything that isn't a plain date-only string, so
 * invalid input still produces an `Invalid Date` rather than being silently accepted.
 */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return new Date(value);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
