import {
  applySimulatedPricingRule,
  driverAgeFactor,
  extractPricingInputFromStep1,
  usageFactor,
  vehicleAgeFactor,
} from './simulated-pricing-rule';
import type { Step1FormValue } from '../models/form-field.model';

const REFERENCE_DATE = new Date(2026, 5, 15);

describe('driverAgeFactor', () => {
  it('applies no surcharge at exactly age 25', () => {
    expect(driverAgeFactor('2001-06-15', REFERENCE_DATE)).toBe(1);
  });

  it('applies no surcharge at exactly age 60', () => {
    expect(driverAgeFactor('1966-06-15', REFERENCE_DATE)).toBe(1);
  });

  it('applies the senior surcharge at exactly age 61', () => {
    expect(driverAgeFactor('1965-06-15', REFERENCE_DATE)).toBe(1.05);
  });

  it('applies the young-driver surcharge under 25', () => {
    expect(driverAgeFactor('2005-06-16', REFERENCE_DATE)).toBe(1.15);
  });

  it('applies no surcharge when the date of birth is missing', () => {
    expect(driverAgeFactor(null, REFERENCE_DATE)).toBe(1);
  });
});

describe('vehicleAgeFactor', () => {
  it('applies no surcharge at exactly 10 years old', () => {
    expect(vehicleAgeFactor(2016, 2026)).toBe(1);
  });

  it('applies the old-vehicle surcharge at exactly 11 years old', () => {
    expect(vehicleAgeFactor(2015, 2026)).toBe(1.1);
  });

  it('applies no surcharge when the vehicle year is missing', () => {
    expect(vehicleAgeFactor(null, 2026)).toBe(1);
  });
});

describe('usageFactor', () => {
  it('applies no surcharge for personal usage', () => {
    expect(usageFactor('personal')).toBe(1);
  });

  it('applies the commercial surcharge', () => {
    expect(usageFactor('commercial')).toBe(1.2);
  });

  it('applies no surcharge when usage is missing', () => {
    expect(usageFactor(null)).toBe(1);
  });
});

describe('applySimulatedPricingRule', () => {
  it('composes all three factors for a young driver, old vehicle, commercial usage', () => {
    // basePrice 1,000,000 * driverAge(1.15, age 21 < 25) * vehicleAge(1.1, 15y > 10)
    // * usage(1.2, commercial) = 1,000,000 * 1.518 = 1,518,000 (hand-verified).
    const adjusted = applySimulatedPricingRule(
      1_000_000,
      { dateOfBirth: '2005-01-01', vehicleYear: 2011, vehicleUsage: 'commercial' },
      REFERENCE_DATE,
    );

    expect(adjusted).toBe(1_518_000);
  });

  it('applies no adjustment for a mid-age driver, recent vehicle, personal usage', () => {
    const adjusted = applySimulatedPricingRule(
      1_000_000,
      { dateOfBirth: '1990-06-15', vehicleYear: 2020, vehicleUsage: 'personal' },
      REFERENCE_DATE,
    );

    expect(adjusted).toBe(1_000_000);
  });
});

describe('extractPricingInputFromStep1', () => {
  it('reads all reserved keys when present and correctly typed', () => {
    const step1: Step1FormValue = {
      dateOfBirth: '1990-01-01',
      vehicleYear: 2018,
      vehicleUsage: 'commercial',
      extraField: 'ignored',
    };

    expect(extractPricingInputFromStep1(step1)).toEqual({
      dateOfBirth: '1990-01-01',
      vehicleYear: 2018,
      vehicleUsage: 'commercial',
    });
  });

  it('falls back to null for a missing or mistyped reserved key, never throwing', () => {
    const step1: Step1FormValue = {
      vehicleYear: '2018', // mistyped: should be a number
      vehicleUsage: 'fleet', // not a recognized usage value
      // dateOfBirth is entirely absent
    };

    expect(extractPricingInputFromStep1(step1)).toEqual({
      dateOfBirth: null,
      vehicleYear: null,
      vehicleUsage: null,
    });
  });
});
