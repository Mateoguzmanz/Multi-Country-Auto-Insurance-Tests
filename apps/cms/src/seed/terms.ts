type CountryCode = 'CO' | 'CL';

interface TermsAndConditionSeed {
  country: CountryCode;
  version: string;
  body: string;
}

export const TERMS_SEEDS: TermsAndConditionSeed[] = [
  {
    country: 'CO',
    version: 'v1.0-CO',
    body: [
      '# Términos y condiciones (texto ficticio de prueba)',
      '',
      'Este documento es un texto ilustrativo para fines de prueba técnica y no constituye ' +
        'una póliza real ni asesoría legal.',
      '',
      'Al aceptar estos términos, la persona cotizante declara que la información suministrada ' +
        'sobre su vehículo y sus datos personales es correcta a la fecha de la cotización.',
      '',
      'El pago simulado en esta plataforma no representa una transacción financiera real y ' +
        'el número de cotización generado es únicamente de referencia para esta prueba.',
    ].join('\n'),
  },
  {
    country: 'CL',
    version: 'v1.0-CL',
    body: [
      '# Términos y condiciones (texto ficticio de prueba)',
      '',
      'Este documento es un texto ilustrativo para fines de prueba técnica y no constituye ' +
        'una póliza real ni asesoría legal.',
      '',
      'Al aceptar estos términos, la persona cotizante declara que la información suministrada ' +
        'sobre su vehículo y sus datos personales es correcta a la fecha de la cotización.',
      '',
      'El pago simulado en esta plataforma no representa una transacción financiera real y ' +
        'el número de cotización generado es únicamente de referencia para esta prueba.',
    ].join('\n'),
  },
];
