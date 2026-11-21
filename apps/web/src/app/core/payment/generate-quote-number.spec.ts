import { generateQuoteNumber } from './generate-quote-number';

describe('generateQuoteNumber', () => {
  it('matches the CO-<yyyy><6 digits> format', () => {
    expect(generateQuoteNumber('CO', new Date(2026, 0, 1))).toMatch(/^CO-\d{10}$/);
  });

  it('matches the CL-<yyyy><6 digits> format', () => {
    expect(generateQuoteNumber('CL', new Date(2026, 0, 1))).toMatch(/^CL-\d{10}$/);
  });

  it('derives the year from the supplied referenceDate', () => {
    expect(generateQuoteNumber('CO', new Date(2031, 0, 1))).toMatch(/^CO-2031\d{6}$/);
  });
});
