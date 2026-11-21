import type { CountryCode } from './country.model';
import type { StrapiRecord } from './strapi.model';

export type FormFieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// A field's rules can vary with another field's current value — e.g. CL's `documentNumber`
// validates differently depending on whether `documentType` is RUT or a passport. Keyed by
// the controlling field's option `value`; any attribute left out falls back to the field's
// own base `validation`/`helpText`/`errorMessage`. Flat (not `{ validation: {...} }`) so it
// can be passed anywhere a `FormFieldValidation` is expected.
export interface FormFieldConditionalRule extends FormFieldValidation {
  helpText?: string;
  errorMessage?: string;
}

export interface FormFieldAttributes {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  validation: FormFieldValidation | null;
  helpText: string | null;
  errorMessage: string;
  order: number;
  country: CountryCode;
  options: FormFieldOption[] | null;
  dependsOnKey: string | null;
  validationByOption: Record<string, FormFieldConditionalRule> | null;
}

export type FormFieldEntry = StrapiRecord<FormFieldAttributes>;

export type FormFieldValue = string | number | boolean | null;

export interface Step1FormValue {
  [fieldKey: string]: FormFieldValue;
}

// Reserved `key` convention — ADR-0002.
export const RESERVED_FORM_FIELD_KEYS = [
  'fullName',
  'documentType',
  'documentNumber',
  'dateOfBirth',
  'email',
  'phone',
  'vehicleMake',
  'vehicleModel',
  'vehicleYear',
  'vehicleIdentifier',
  'vehicleUsage',
] as const;

export type ReservedFormFieldKey = (typeof RESERVED_FORM_FIELD_KEYS)[number];

// US-02/US-03 read exactly this projection of `Step1FormValue`, never the raw dynamic map.
export interface ReservedStep1Fields {
  fullName: string;
  documentType: string;
  documentNumber: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleIdentifier: string;
  vehicleUsage: 'personal' | 'commercial';
}
