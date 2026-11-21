import { projectReservedStep1Fields } from './project-reserved-step1-fields';
import { RESERVED_FORM_FIELD_KEYS, type ReservedFormFieldKey, type Step1FormValue } from '../models/form-field.model';

const VALID_STEP1: Step1FormValue = {
  fullName: 'Jane Doe',
  documentType: 'CC',
  documentNumber: '1012345632',
  dateOfBirth: '1990-01-01',
  email: 'jane@example.com',
  phone: '3001234567',
  vehicleMake: 'Toyota',
  vehicleModel: 'Corolla',
  vehicleYear: 2020,
  vehicleIdentifier: 'ABC123',
  vehicleUsage: 'personal',
};

describe('projectReservedStep1Fields', () => {
  it('projects a fully valid step-1 value onto the reserved fields', () => {
    expect(projectReservedStep1Fields(VALID_STEP1)).toEqual({
      fullName: 'Jane Doe',
      documentType: 'CC',
      documentNumber: '1012345632',
      dateOfBirth: '1990-01-01',
      email: 'jane@example.com',
      phone: '3001234567',
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: 2020,
      vehicleIdentifier: 'ABC123',
      vehicleUsage: 'personal',
    });
  });

  it.each(RESERVED_FORM_FIELD_KEYS)('returns null when reserved key "%s" is missing', (key: ReservedFormFieldKey) => {
    const { [key]: _omitted, ...rest } = VALID_STEP1;
    expect(projectReservedStep1Fields(rest)).toBeNull();
  });

  it('returns null when the number-typed vehicleYear is the wrong type', () => {
    expect(projectReservedStep1Fields({ ...VALID_STEP1, vehicleYear: '2020' })).toBeNull();
  });

  it('returns null when the enum-typed vehicleUsage holds an unrecognized value', () => {
    expect(projectReservedStep1Fields({ ...VALID_STEP1, vehicleUsage: 'fleet' })).toBeNull();
  });
});
