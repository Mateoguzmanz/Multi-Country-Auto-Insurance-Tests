import type { CountryCode } from '../models/country.model';

function stripSeparators(value: string): string {
  return value.replace(/[.\-\s]/g, '');
}

function isSeparator(char: string): boolean {
  return char === '.' || char === '-';
}

function formatChileanRut(cleaned: string): string {
  if (cleaned.length <= 1) {
    return cleaned;
  }

  const checkDigit = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);
  const groups: string[] = [];
  for (let end = body.length; end > 0; end -= 3) {
    groups.unshift(body.slice(Math.max(0, end - 3), end));
  }

  return groups.length > 0 ? `${groups.join('.')}-${checkDigit}` : checkDigit;
}

// CL's `documentNumber` field accepts either a RUT or a passport number (see ADR-0002 /
// the CL form-field seed) — only a RUT is actually grouped in 3s with a trailing check
// digit. A passport number containing letters is displayed as entered instead of being
// forced into a RUT-shaped grouping it was never in.
function looksLikeRut(cleaned: string): boolean {
  return /^[0-9]+$/.test(cleaned);
}

function formatForCountry(cleaned: string, country: CountryCode): string {
  return country === 'CL' && looksLikeRut(cleaned) ? formatChileanRut(cleaned) : cleaned;
}

/**
 * US-03 masking rule (specs/US-03-summary-payment.md, Resolutions): keeps the first 2 and
 * last 2 characters of the country-formatted display visible (only the last character for
 * a raw value of 4 characters or fewer), masks every other identifier character with "•",
 * and leaves grouping separators (".", "-") untouched so a CL RUT still reads as grouped.
 */
export function maskDocumentNumber(rawValue: string, country: CountryCode): string {
  const cleaned = stripSeparators(rawValue.trim());
  if (cleaned.length === 0) {
    return '';
  }

  const display = formatForCountry(cleaned, country);
  const isShort = cleaned.length <= 4;

  return Array.from(display)
    .map((char, index) => {
      if (isSeparator(char)) {
        return char;
      }
      const isVisible = isShort ? index === display.length - 1 : index < 2 || index >= display.length - 2;
      return isVisible ? char : '•';
    })
    .join('');
}
