type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';
type CountryCode = 'CO' | 'CL';

// Same JSON-field constraint as FormFieldValidation below: this needs a genuine string
// index signature (not a mapped type over specific literal keys) to structurally
// satisfy Strapi's generated JSON value type.
type FormFieldOption = Record<string, string>;

// Strapi stores this field as JSON. A plain index-signature record (rather than a
// named-property interface) is what structurally satisfies the generated JSON value
// type; `undefined` is deliberately excluded from the value union since it isn't a
// valid JSON value — omit a key entirely instead of setting it to undefined. The keys
// used below (min, max, minLength, maxLength, pattern) are still checked against this
// type at each call site.
type FormFieldValidation = Record<string, number | string>;

// Flat, like FormFieldValidation above (same JSON-field index-signature constraint): the
// validation keys (pattern, min, max, minLength, maxLength) plus optional helpText/
// errorMessage overrides, all at the same level — not nested under a `validation` key.
type FormFieldConditionalRule = Record<string, string | number>;

interface FormFieldSeed {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  country: CountryCode;
  helpText?: string;
  errorMessage: string;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
  dependsOnKey?: string;
  validationByOption?: Record<string, FormFieldConditionalRule>;
}

const currentYear = new Date().getFullYear();
const vehicleYearValidation: FormFieldValidation = {
  min: currentYear - 20,
  max: currentYear + 1,
};

const VEHICLE_MAKE_OPTIONS: FormFieldOption[] = [
  { label: 'Chevrolet', value: 'chevrolet' },
  { label: 'Renault', value: 'renault' },
  { label: 'Mazda', value: 'mazda' },
  { label: 'Toyota', value: 'toyota' },
  { label: 'Kia', value: 'kia' },
];

const VEHICLE_USAGE_OPTIONS: FormFieldOption[] = [
  { label: 'Personal', value: 'personal' },
  { label: 'Commercial', value: 'commercial' },
];

// Illustrative patterns only — not a claim of legal/regulatory correctness; the
// business team is free to replace these in Strapi (see US-01's "Open questions").
const CO_FORM_FIELDS: FormFieldSeed[] = [
  {
    key: 'fullName',
    label: 'Full name',
    type: 'text',
    required: true,
    order: 1,
    country: 'CO',
    helpText: 'Enter your full name exactly as it appears on your ID document.',
    errorMessage: 'Full name is required.',
  },
  {
    key: 'documentType',
    label: 'Document type',
    type: 'select',
    required: true,
    order: 2,
    country: 'CO',
    errorMessage: 'Select a document type.',
    options: [
      { label: 'National ID (Cédula de ciudadanía)', value: 'CC' },
      { label: 'Foreign ID (Cédula de extranjería)', value: 'CE' },
    ],
  },
  {
    key: 'documentNumber',
    label: 'Document number',
    type: 'text',
    required: true,
    order: 3,
    country: 'CO',
    helpText: 'Enter the number without dots or spaces.',
    errorMessage: 'Enter a valid document number (6 to 10 digits).',
    validation: { pattern: '^[0-9]{6,10}$' },
  },
  {
    key: 'dateOfBirth',
    label: 'Date of birth',
    type: 'date',
    required: true,
    order: 4,
    country: 'CO',
    errorMessage: 'You must be of legal age (18 years) to continue.',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    required: true,
    order: 5,
    country: 'CO',
    errorMessage: 'Enter a valid email address.',
    validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  {
    key: 'phone',
    label: 'Contact phone',
    type: 'text',
    required: true,
    order: 6,
    country: 'CO',
    helpText: '10-digit mobile number.',
    errorMessage: 'Enter a valid Colombian mobile phone number.',
    validation: { pattern: '^3[0-9]{9}$' },
  },
  {
    key: 'vehicleMake',
    label: 'Vehicle make',
    type: 'select',
    required: true,
    order: 7,
    country: 'CO',
    errorMessage: 'Select your vehicle make.',
    options: VEHICLE_MAKE_OPTIONS,
  },
  {
    key: 'vehicleModel',
    label: 'Vehicle model',
    type: 'text',
    required: true,
    order: 8,
    country: 'CO',
    errorMessage: 'Enter your vehicle model.',
  },
  {
    key: 'vehicleYear',
    label: 'Vehicle year',
    type: 'number',
    required: true,
    order: 9,
    country: 'CO',
    helpText: 'Cannot be later than next year or more than 20 years old.',
    errorMessage: `Enter a vehicle year between ${currentYear - 20} and ${currentYear + 1}.`,
    validation: vehicleYearValidation,
  },
  {
    key: 'vehicleIdentifier',
    label: 'License plate',
    type: 'text',
    required: true,
    order: 10,
    country: 'CO',
    helpText: 'Example: ABC123.',
    errorMessage: 'Enter a valid Colombian license plate (3 letters and 3 numbers).',
    validation: { pattern: '^[A-Z]{3}[0-9]{3}$' },
  },
  {
    key: 'vehicleUsage',
    label: 'Vehicle usage',
    type: 'select',
    required: true,
    order: 11,
    country: 'CO',
    errorMessage: 'Select the main use of the vehicle.',
    options: VEHICLE_USAGE_OPTIONS,
  },
  {
    key: 'city',
    label: 'City',
    type: 'select',
    required: false,
    order: 12,
    country: 'CO',
    helpText: 'City where the vehicle is mainly used.',
    errorMessage: 'Select a city.',
    options: [
      { label: 'Bogotá', value: 'bogota' },
      { label: 'Medellín', value: 'medellin' },
      { label: 'Cali', value: 'cali' },
      { label: 'Barranquilla', value: 'barranquilla' },
    ],
  },
  {
    key: 'hasAntitheftDevice',
    label: 'Does the vehicle have an anti-theft device?',
    type: 'checkbox',
    required: false,
    order: 13,
    country: 'CO',
    errorMessage: 'Select an option.',
  },
];

const CL_FORM_FIELDS: FormFieldSeed[] = [
  {
    key: 'fullName',
    label: 'Full name',
    type: 'text',
    required: true,
    order: 1,
    country: 'CL',
    helpText: 'Enter your full name exactly as it appears on your identity card.',
    errorMessage: 'Full name is required.',
  },
  {
    key: 'documentType',
    label: 'Document type',
    type: 'select',
    required: true,
    order: 2,
    country: 'CL',
    errorMessage: 'Select a document type.',
    options: [
      { label: 'National ID (RUT)', value: 'RUT' },
      { label: 'Passport', value: 'PASSPORT' },
    ],
  },
  {
    key: 'documentNumber',
    label: 'Document number',
    type: 'text',
    required: true,
    order: 3,
    country: 'CL',
    helpText: 'First select the document type.',
    errorMessage: 'Enter a valid document number.',
    // Base rule used only before `documentType` has a value — once it does,
    // `validationByOption` below takes over (see `dependsOnKey`).
    validation: { pattern: '^([0-9]{7,8}-[0-9Kk]|[A-Za-z0-9]{6,12})$' },
    dependsOnKey: 'documentType',
    validationByOption: {
      RUT: {
        pattern: '^[0-9]{7,8}-[0-9Kk]$',
        helpText: 'Format: 12345678-9 (no dots).',
        errorMessage: 'Enter a valid Chilean RUT.',
      },
      PASSPORT: {
        pattern: '^[A-Za-z0-9]{6,12}$',
        helpText: 'Enter the passport number exactly as it appears on the document.',
        errorMessage: 'Enter a valid passport number.',
      },
    },
  },
  {
    key: 'dateOfBirth',
    label: 'Date of birth',
    type: 'date',
    required: true,
    order: 4,
    country: 'CL',
    errorMessage: 'You must be of legal age (18 years) to continue.',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    required: true,
    order: 5,
    country: 'CL',
    errorMessage: 'Enter a valid email address.',
    validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  {
    key: 'phone',
    label: 'Contact phone',
    type: 'text',
    required: true,
    order: 6,
    country: 'CL',
    helpText: '9-digit mobile number, starting with 9.',
    errorMessage: 'Enter a valid Chilean mobile phone number.',
    validation: { pattern: '^9[0-9]{8}$' },
  },
  {
    key: 'vehicleMake',
    label: 'Vehicle make',
    type: 'select',
    required: true,
    order: 7,
    country: 'CL',
    errorMessage: 'Select your vehicle make.',
    options: VEHICLE_MAKE_OPTIONS,
  },
  {
    key: 'vehicleModel',
    label: 'Vehicle model',
    type: 'text',
    required: true,
    order: 8,
    country: 'CL',
    errorMessage: 'Enter your vehicle model.',
  },
  {
    key: 'vehicleYear',
    label: 'Vehicle year',
    type: 'number',
    required: true,
    order: 9,
    country: 'CL',
    helpText: 'Cannot be later than next year or more than 20 years old.',
    errorMessage: `Enter a vehicle year between ${currentYear - 20} and ${currentYear + 1}.`,
    validation: vehicleYearValidation,
  },
  {
    key: 'vehicleIdentifier',
    label: 'License plate',
    type: 'text',
    required: true,
    order: 10,
    country: 'CL',
    helpText: 'Example: AB1234.',
    errorMessage: 'Enter a valid Chilean license plate (2 letters and 4 numbers).',
    validation: { pattern: '^[A-Z]{2}[0-9]{4}$' },
  },
  {
    key: 'vehicleUsage',
    label: 'Vehicle usage',
    type: 'select',
    required: true,
    order: 11,
    country: 'CL',
    errorMessage: 'Select the main use of the vehicle.',
    options: VEHICLE_USAGE_OPTIONS,
  },
  {
    key: 'region',
    label: 'Region',
    type: 'select',
    required: false,
    order: 12,
    country: 'CL',
    helpText: 'Region where the vehicle is mainly used.',
    errorMessage: 'Select a region.',
    options: [
      { label: 'Metropolitana de Santiago', value: 'metropolitana' },
      { label: 'Valparaíso', value: 'valparaiso' },
      { label: 'Biobío', value: 'biobio' },
    ],
  },
  {
    key: 'hasDashcam',
    label: 'Does the vehicle have a dashcam?',
    type: 'checkbox',
    required: false,
    order: 13,
    country: 'CL',
    errorMessage: 'Select an option.',
  },
];

export const FORM_FIELD_SEEDS: FormFieldSeed[] = [...CO_FORM_FIELDS, ...CL_FORM_FIELDS];
