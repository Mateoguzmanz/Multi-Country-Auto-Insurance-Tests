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
  { label: 'Comercial', value: 'commercial' },
];

// Illustrative patterns only — not a claim of legal/regulatory correctness; the
// business team is free to replace these in Strapi (see US-01's "Open questions").
const CO_FORM_FIELDS: FormFieldSeed[] = [
  {
    key: 'fullName',
    label: 'Nombre completo',
    type: 'text',
    required: true,
    order: 1,
    country: 'CO',
    helpText: 'Ingresa tu nombre completo, tal como aparece en tu documento de identidad.',
    errorMessage: 'El nombre completo es obligatorio.',
  },
  {
    key: 'documentType',
    label: 'Tipo de documento',
    type: 'select',
    required: true,
    order: 2,
    country: 'CO',
    errorMessage: 'Selecciona un tipo de documento.',
    options: [
      { label: 'Cédula de ciudadanía', value: 'CC' },
      { label: 'Cédula de extranjería', value: 'CE' },
    ],
  },
  {
    key: 'documentNumber',
    label: 'Número de documento',
    type: 'text',
    required: true,
    order: 3,
    country: 'CO',
    helpText: 'Ingresa el número sin puntos ni espacios.',
    errorMessage: 'Ingresa un número de documento válido (6 a 10 dígitos).',
    validation: { pattern: '^[0-9]{6,10}$' },
  },
  {
    key: 'dateOfBirth',
    label: 'Fecha de nacimiento',
    type: 'date',
    required: true,
    order: 4,
    country: 'CO',
    errorMessage: 'Debes ser mayor de edad (18 años) para continuar.',
  },
  {
    key: 'email',
    label: 'Correo electrónico',
    type: 'text',
    required: true,
    order: 5,
    country: 'CO',
    errorMessage: 'Ingresa un correo electrónico válido.',
    validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  {
    key: 'phone',
    label: 'Teléfono de contacto',
    type: 'text',
    required: true,
    order: 6,
    country: 'CO',
    helpText: 'Número celular a 10 dígitos.',
    errorMessage: 'Ingresa un teléfono celular colombiano válido.',
    validation: { pattern: '^3[0-9]{9}$' },
  },
  {
    key: 'vehicleMake',
    label: 'Marca del vehículo',
    type: 'select',
    required: true,
    order: 7,
    country: 'CO',
    errorMessage: 'Selecciona la marca de tu vehículo.',
    options: VEHICLE_MAKE_OPTIONS,
  },
  {
    key: 'vehicleModel',
    label: 'Modelo del vehículo',
    type: 'text',
    required: true,
    order: 8,
    country: 'CO',
    errorMessage: 'Ingresa el modelo de tu vehículo.',
  },
  {
    key: 'vehicleYear',
    label: 'Año del vehículo',
    type: 'number',
    required: true,
    order: 9,
    country: 'CO',
    helpText: 'No puede ser mayor al próximo año ni tener más de 20 años de antigüedad.',
    errorMessage: `Ingresa un año de vehículo entre ${currentYear - 20} y ${currentYear + 1}.`,
    validation: vehicleYearValidation,
  },
  {
    key: 'vehicleIdentifier',
    label: 'Placa',
    type: 'text',
    required: true,
    order: 10,
    country: 'CO',
    helpText: 'Ejemplo: ABC123.',
    errorMessage: 'Ingresa una placa colombiana válida (3 letras y 3 números).',
    validation: { pattern: '^[A-Z]{3}[0-9]{3}$' },
  },
  {
    key: 'vehicleUsage',
    label: 'Uso del vehículo',
    type: 'select',
    required: true,
    order: 11,
    country: 'CO',
    errorMessage: 'Selecciona el uso principal del vehículo.',
    options: VEHICLE_USAGE_OPTIONS,
  },
  {
    key: 'city',
    label: 'Ciudad de circulación',
    type: 'select',
    required: false,
    order: 12,
    country: 'CO',
    helpText: 'Ciudad donde circula principalmente el vehículo.',
    errorMessage: 'Selecciona una ciudad.',
    options: [
      { label: 'Bogotá', value: 'bogota' },
      { label: 'Medellín', value: 'medellin' },
      { label: 'Cali', value: 'cali' },
      { label: 'Barranquilla', value: 'barranquilla' },
    ],
  },
  {
    key: 'hasAntitheftDevice',
    label: '¿El vehículo tiene dispositivo antirrobo?',
    type: 'checkbox',
    required: false,
    order: 13,
    country: 'CO',
    errorMessage: 'Selecciona una opción.',
  },
];

const CL_FORM_FIELDS: FormFieldSeed[] = [
  {
    key: 'fullName',
    label: 'Nombre completo',
    type: 'text',
    required: true,
    order: 1,
    country: 'CL',
    helpText: 'Ingresa tu nombre completo, tal como aparece en tu cédula de identidad.',
    errorMessage: 'El nombre completo es obligatorio.',
  },
  {
    key: 'documentType',
    label: 'Tipo de documento',
    type: 'select',
    required: true,
    order: 2,
    country: 'CL',
    errorMessage: 'Selecciona un tipo de documento.',
    options: [
      { label: 'RUT', value: 'RUT' },
      { label: 'Pasaporte', value: 'PASSPORT' },
    ],
  },
  {
    key: 'documentNumber',
    label: 'Número de documento',
    type: 'text',
    required: true,
    order: 3,
    country: 'CL',
    helpText: 'Selecciona primero el tipo de documento.',
    errorMessage: 'Ingresa un número de documento válido.',
    // Base rule used only before `documentType` has a value — once it does,
    // `validationByOption` below takes over (see `dependsOnKey`).
    validation: { pattern: '^([0-9]{7,8}-[0-9Kk]|[A-Za-z0-9]{6,12})$' },
    dependsOnKey: 'documentType',
    validationByOption: {
      RUT: {
        pattern: '^[0-9]{7,8}-[0-9Kk]$',
        helpText: 'Formato: 12345678-9 (sin puntos).',
        errorMessage: 'Ingresa un RUT chileno válido.',
      },
      PASSPORT: {
        pattern: '^[A-Za-z0-9]{6,12}$',
        helpText: 'Ingresa el número de pasaporte tal como aparece en el documento.',
        errorMessage: 'Ingresa un número de pasaporte válido.',
      },
    },
  },
  {
    key: 'dateOfBirth',
    label: 'Fecha de nacimiento',
    type: 'date',
    required: true,
    order: 4,
    country: 'CL',
    errorMessage: 'Debes ser mayor de edad (18 años) para continuar.',
  },
  {
    key: 'email',
    label: 'Correo electrónico',
    type: 'text',
    required: true,
    order: 5,
    country: 'CL',
    errorMessage: 'Ingresa un correo electrónico válido.',
    validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  },
  {
    key: 'phone',
    label: 'Teléfono de contacto',
    type: 'text',
    required: true,
    order: 6,
    country: 'CL',
    helpText: 'Número celular a 9 dígitos, comenzando en 9.',
    errorMessage: 'Ingresa un teléfono celular chileno válido.',
    validation: { pattern: '^9[0-9]{8}$' },
  },
  {
    key: 'vehicleMake',
    label: 'Marca del vehículo',
    type: 'select',
    required: true,
    order: 7,
    country: 'CL',
    errorMessage: 'Selecciona la marca de tu vehículo.',
    options: VEHICLE_MAKE_OPTIONS,
  },
  {
    key: 'vehicleModel',
    label: 'Modelo del vehículo',
    type: 'text',
    required: true,
    order: 8,
    country: 'CL',
    errorMessage: 'Ingresa el modelo de tu vehículo.',
  },
  {
    key: 'vehicleYear',
    label: 'Año del vehículo',
    type: 'number',
    required: true,
    order: 9,
    country: 'CL',
    helpText: 'No puede ser mayor al próximo año ni tener más de 20 años de antigüedad.',
    errorMessage: `Ingresa un año de vehículo entre ${currentYear - 20} y ${currentYear + 1}.`,
    validation: vehicleYearValidation,
  },
  {
    key: 'vehicleIdentifier',
    label: 'Patente',
    type: 'text',
    required: true,
    order: 10,
    country: 'CL',
    helpText: 'Ejemplo: AB1234.',
    errorMessage: 'Ingresa una patente chilena válida (2 letras y 4 números).',
    validation: { pattern: '^[A-Z]{2}[0-9]{4}$' },
  },
  {
    key: 'vehicleUsage',
    label: 'Uso del vehículo',
    type: 'select',
    required: true,
    order: 11,
    country: 'CL',
    errorMessage: 'Selecciona el uso principal del vehículo.',
    options: VEHICLE_USAGE_OPTIONS,
  },
  {
    key: 'region',
    label: 'Región de circulación',
    type: 'select',
    required: false,
    order: 12,
    country: 'CL',
    helpText: 'Región donde circula principalmente el vehículo.',
    errorMessage: 'Selecciona una región.',
    options: [
      { label: 'Metropolitana de Santiago', value: 'metropolitana' },
      { label: 'Valparaíso', value: 'valparaiso' },
      { label: 'Biobío', value: 'biobio' },
    ],
  },
  {
    key: 'hasDashcam',
    label: '¿El vehículo tiene dashcam?',
    type: 'checkbox',
    required: false,
    order: 13,
    country: 'CL',
    errorMessage: 'Selecciona una opción.',
  },
];

export const FORM_FIELD_SEEDS: FormFieldSeed[] = [...CO_FORM_FIELDS, ...CL_FORM_FIELDS];
