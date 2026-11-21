type CountryCode = 'CO' | 'CL';
type Currency = 'COP' | 'CLP';

interface PlanDetailItemSeed {
  name: string;
  description: string;
}

interface PlanSeed {
  name: string;
  shortDescription: string;
  basePrice: number;
  currency: Currency;
  coverages: PlanDetailItemSeed[];
  benefits: PlanDetailItemSeed[];
  order: number;
  recommended: boolean;
  active: boolean;
  country: CountryCode;
}

const CO_PLANS: PlanSeed[] = [
  {
    name: 'Plan Básico',
    shortDescription: 'Cobertura esencial para tu vehículo a un precio accesible.',
    basePrice: 450000,
    currency: 'COP',
    order: 1,
    recommended: false,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'Responsabilidad civil', description: 'Cubre daños a terceros causados por tu vehículo.' },
      { name: 'Asistencia en vía', description: 'Grúa y auxilio mecánico básico, disponible 24/7.' },
    ],
    benefits: [
      { name: 'Línea de atención', description: 'Soporte telefónico simulado disponible 24/7.' },
    ],
  },
  {
    name: 'Plan Esencial Plus',
    shortDescription: 'El equilibrio entre precio y cobertura para el día a día.',
    basePrice: 680000,
    currency: 'COP',
    order: 2,
    recommended: true,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'Responsabilidad civil ampliada', description: 'Mayor límite de cobertura frente a terceros.' },
      { name: 'Daños parciales', description: 'Cubre colisiones y choques parciales del vehículo asegurado.' },
      { name: 'Robo total', description: 'Indemnización simulada en caso de hurto total del vehículo.' },
    ],
    benefits: [
      { name: 'Vehículo de reemplazo', description: 'Vehículo de reemplazo simulado por hasta 5 días.' },
      { name: 'Descuento en llantas', description: '10% de descuento simulado en talleres aliados.' },
    ],
  },
  {
    name: 'Plan Premium',
    shortDescription: 'Cobertura integral todo riesgo para máxima tranquilidad.',
    basePrice: 1250000,
    currency: 'COP',
    order: 3,
    recommended: false,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'Todo riesgo', description: 'Cobertura amplia que incluye daños propios del vehículo.' },
      { name: 'Responsabilidad civil ampliada', description: 'Mayor límite de cobertura frente a terceros.' },
      { name: 'Robo total y parcial', description: 'Indemnización simulada por hurto total o de partes.' },
    ],
    benefits: [
      { name: 'Vehículo de reemplazo extendido', description: 'Vehículo de reemplazo simulado por hasta 15 días.' },
      { name: 'Conductor elegido', description: 'Servicio de conductor elegido simulado, 4 veces al año.' },
      { name: 'Asesoría legal', description: 'Orientación legal simulada en caso de siniestro.' },
    ],
  },
  {
    name: 'Plan Corporativo',
    shortDescription: 'Cobertura para flotas empresariales — en preparación.',
    basePrice: 2100000,
    currency: 'COP',
    order: 4,
    recommended: false,
    active: false,
    country: 'CO',
    coverages: [
      { name: 'Flota empresarial', description: 'Cobertura simulada para más de un vehículo por póliza.' },
    ],
    benefits: [
      { name: 'Gestor de cuenta', description: 'Gestor de cuenta simulado dedicado para la empresa.' },
    ],
  },
];

const CL_PLANS: PlanSeed[] = [
  {
    name: 'Plan Básico',
    shortDescription: 'Cobertura esencial para tu vehículo a un precio accesible.',
    basePrice: 85000,
    currency: 'CLP',
    order: 1,
    recommended: false,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'Responsabilidad civil', description: 'Cubre daños a terceros causados por tu vehículo.' },
      { name: 'Asistencia en ruta', description: 'Grúa y auxilio mecánico básico, disponible 24/7.' },
    ],
    benefits: [
      { name: 'Línea de atención', description: 'Soporte telefónico simulado disponible 24/7.' },
    ],
  },
  {
    name: 'Plan Esencial Plus',
    shortDescription: 'El equilibrio entre precio y cobertura para el día a día.',
    basePrice: 120000,
    currency: 'CLP',
    order: 2,
    recommended: true,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'Responsabilidad civil ampliada', description: 'Mayor límite de cobertura frente a terceros.' },
      { name: 'Daños parciales', description: 'Cubre colisiones y choques parciales del vehículo asegurado.' },
      { name: 'Robo total', description: 'Indemnización simulada en caso de robo total del vehículo.' },
    ],
    benefits: [
      { name: 'Vehículo de reemplazo', description: 'Vehículo de reemplazo simulado por hasta 5 días.' },
      { name: 'Descuento en neumáticos', description: '10% de descuento simulado en talleres aliados.' },
    ],
  },
  {
    name: 'Plan Premium',
    shortDescription: 'Cobertura integral todo riesgo para máxima tranquilidad.',
    basePrice: 210000,
    currency: 'CLP',
    order: 3,
    recommended: false,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'Todo riesgo', description: 'Cobertura amplia que incluye daños propios del vehículo.' },
      { name: 'Responsabilidad civil ampliada', description: 'Mayor límite de cobertura frente a terceros.' },
      { name: 'Robo total y parcial', description: 'Indemnización simulada por robo total o de partes.' },
    ],
    benefits: [
      { name: 'Vehículo de reemplazo extendido', description: 'Vehículo de reemplazo simulado por hasta 15 días.' },
      { name: 'Conductor designado', description: 'Servicio de conductor designado simulado, 4 veces al año.' },
      { name: 'Asesoría legal', description: 'Orientación legal simulada en caso de siniestro.' },
    ],
  },
  {
    name: 'Plan Corporativo',
    shortDescription: 'Cobertura para flotas empresariales — en preparación.',
    basePrice: 390000,
    currency: 'CLP',
    order: 4,
    recommended: false,
    active: false,
    country: 'CL',
    coverages: [
      { name: 'Flota empresarial', description: 'Cobertura simulada para más de un vehículo por póliza.' },
    ],
    benefits: [
      { name: 'Gestor de cuenta', description: 'Gestor de cuenta simulado dedicado para la empresa.' },
    ],
  },
];

export const PLAN_SEEDS: PlanSeed[] = [...CO_PLANS, ...CL_PLANS];
