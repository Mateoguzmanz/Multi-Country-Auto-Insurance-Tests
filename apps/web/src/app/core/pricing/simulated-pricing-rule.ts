import type { Step1FormValue } from '../models/form-field.model';

export type VehicleUsage = 'personal' | 'commercial';

export interface SimulatedPricingRuleInput {
  dateOfBirth: string | null;
  vehicleYear: number | null;
  vehicleUsage: VehicleUsage | null;
}

/**
 * SIMULATED-PRICING-RULE-v1 (specs/US-02-plan-list.md, approved 2026-11-21).
 * Illustrative only — not an actuarial rating engine.
 */
export function applySimulatedPricingRule(
  basePrice: number,
  input: SimulatedPricingRuleInput,
  referenceDate: Date = new Date(),
): number {
  const factor =
    driverAgeFactor(input.dateOfBirth, referenceDate) *
    vehicleAgeFactor(input.vehicleYear, referenceDate.getFullYear()) *
    usageFactor(input.vehicleUsage);

  return Math.round(basePrice * factor);
}

export function driverAgeFactor(dateOfBirth: string | null, referenceDate: Date = new Date()): number {
  const age = calculateAge(dateOfBirth, referenceDate);
  if (age === null) {
    return 1;
  }
  if (age < 25) {
    return 1.15;
  }
  if (age > 60) {
    return 1.05;
  }
  return 1;
}

export function vehicleAgeFactor(vehicleYear: number | null, currentYear: number = new Date().getFullYear()): number {
  if (vehicleYear === null) {
    return 1;
  }
  return currentYear - vehicleYear > 10 ? 1.1 : 1;
}

export function usageFactor(vehicleUsage: VehicleUsage | null): number {
  return vehicleUsage === 'commercial' ? 1.2 : 1;
}

function calculateAge(dateOfBirth: string | null, referenceDate: Date): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - dob.getFullYear();
  const birthdayPassedThisYear =
    referenceDate.getMonth() > dob.getMonth() ||
    (referenceDate.getMonth() === dob.getMonth() && referenceDate.getDate() >= dob.getDate());
  if (!birthdayPassedThisYear) {
    age -= 1;
  }

  return age;
}

/**
 * Reads the reserved keys (ADR-0002) the pricing rule depends on out of the dynamic
 * step-1 map. A missing or mistyped key falls back to "no adjustment for that factor"
 * rather than guessing a business meaning or throwing.
 */
export function extractPricingInputFromStep1(step1: Step1FormValue): SimulatedPricingRuleInput {
  const dateOfBirth = step1['dateOfBirth'];
  const vehicleYear = step1['vehicleYear'];
  const vehicleUsage = step1['vehicleUsage'];

  return {
    dateOfBirth: typeof dateOfBirth === 'string' && dateOfBirth !== '' ? dateOfBirth : null,
    vehicleYear: typeof vehicleYear === 'number' ? vehicleYear : null,
    vehicleUsage: vehicleUsage === 'personal' || vehicleUsage === 'commercial' ? vehicleUsage : null,
  };
}
