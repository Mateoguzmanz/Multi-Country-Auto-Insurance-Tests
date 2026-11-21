import type { CountryCode } from '../models/country.model';

/**
 * Simulated quote number format (specs/US-03-summary-payment.md, Resolutions):
 * `<country>-<yyyy><6 digits>`, e.g. `CO-2026384012`. No uniqueness guarantee beyond the
 * current session.
 */
export function generateQuoteNumber(country: CountryCode, referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const sequence = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `${country}-${year}${sequence}`;
}
