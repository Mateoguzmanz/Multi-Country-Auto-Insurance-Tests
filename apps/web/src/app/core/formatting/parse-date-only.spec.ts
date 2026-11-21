import { parseDateOnly } from './parse-date-only';

describe('parseDateOnly', () => {
  it('parses a date-only string as local midnight, not UTC midnight', () => {
    const parsed = parseDateOnly('2008-06-15');

    expect(parsed.getFullYear()).toBe(2008);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(15);
  });

  it('produces an Invalid Date for malformed input instead of silently accepting it', () => {
    expect(Number.isNaN(parseDateOnly('not-a-date').getTime())).toBe(true);
  });
});
