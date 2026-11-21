import type { ReservedStep1Fields, Step1FormValue } from '../models/form-field.model';

/**
 * Projects the dynamic step-1 map onto the reserved semantic fields (ADR-0002). Returns
 * null if any reserved key is missing or holds the wrong type — e.g. the person navigated
 * directly to a later step without completing step 1 — rather than rendering a partial
 * summary with gaps.
 */
export function projectReservedStep1Fields(step1: Step1FormValue): ReservedStep1Fields | null {
  const fullName = step1['fullName'];
  const documentType = step1['documentType'];
  const documentNumber = step1['documentNumber'];
  const dateOfBirth = step1['dateOfBirth'];
  const email = step1['email'];
  const phone = step1['phone'];
  const vehicleMake = step1['vehicleMake'];
  const vehicleModel = step1['vehicleModel'];
  const vehicleYear = step1['vehicleYear'];
  const vehicleIdentifier = step1['vehicleIdentifier'];
  const vehicleUsage = step1['vehicleUsage'];

  if (
    typeof fullName !== 'string' ||
    fullName === '' ||
    typeof documentType !== 'string' ||
    documentType === '' ||
    typeof documentNumber !== 'string' ||
    documentNumber === '' ||
    typeof dateOfBirth !== 'string' ||
    dateOfBirth === '' ||
    typeof email !== 'string' ||
    email === '' ||
    typeof phone !== 'string' ||
    phone === '' ||
    typeof vehicleMake !== 'string' ||
    vehicleMake === '' ||
    typeof vehicleModel !== 'string' ||
    vehicleModel === '' ||
    typeof vehicleYear !== 'number' ||
    typeof vehicleIdentifier !== 'string' ||
    vehicleIdentifier === '' ||
    (vehicleUsage !== 'personal' && vehicleUsage !== 'commercial')
  ) {
    return null;
  }

  return {
    fullName,
    documentType,
    documentNumber,
    dateOfBirth,
    email,
    phone,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleIdentifier,
    vehicleUsage,
  };
}
