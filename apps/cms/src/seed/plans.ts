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
    name: 'Basic Plan',
    shortDescription: 'Essential coverage for your vehicle at an affordable price.',
    basePrice: 450000,
    currency: 'COP',
    order: 1,
    recommended: false,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'Civil liability', description: 'Covers damage to third parties caused by your vehicle.' },
      { name: 'Roadside assistance', description: 'Basic towing and roadside mechanical assistance, available 24/7.' },
    ],
    benefits: [
      { name: 'Support line', description: 'Simulated 24/7 phone support.' },
    ],
  },
  {
    name: 'Essential Plus Plan',
    shortDescription: 'The right balance between price and coverage for everyday use.',
    basePrice: 680000,
    currency: 'COP',
    order: 2,
    recommended: true,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'Extended civil liability', description: 'Higher coverage limit for third-party claims.' },
      { name: 'Partial damage', description: 'Covers collisions and partial damage to the insured vehicle.' },
      { name: 'Total theft', description: 'Simulated compensation in case of total vehicle theft.' },
    ],
    benefits: [
      { name: 'Replacement vehicle', description: 'Simulated replacement vehicle for up to 5 days.' },
      { name: 'Tire discount', description: '10% simulated discount at partner workshops.' },
    ],
  },
  {
    name: 'Premium Plan',
    shortDescription: 'Comprehensive all-risk coverage for maximum peace of mind.',
    basePrice: 1250000,
    currency: 'COP',
    order: 3,
    recommended: false,
    active: true,
    country: 'CO',
    coverages: [
      { name: 'All-risk', description: 'Broad coverage that includes damage to the insured vehicle itself.' },
      { name: 'Extended civil liability', description: 'Higher coverage limit for third-party claims.' },
      { name: 'Total and partial theft', description: 'Simulated compensation for total theft or stolen parts.' },
    ],
    benefits: [
      { name: 'Extended replacement vehicle', description: 'Simulated replacement vehicle for up to 15 days.' },
      { name: 'Designated driver', description: 'Simulated designated-driver service, 4 times a year.' },
      { name: 'Legal advice', description: 'Simulated legal guidance in case of a claim.' },
    ],
  },
  {
    name: 'Corporate Plan',
    shortDescription: 'Coverage for business fleets — coming soon.',
    basePrice: 2100000,
    currency: 'COP',
    order: 4,
    recommended: false,
    active: false,
    country: 'CO',
    coverages: [
      { name: 'Business fleet', description: 'Simulated coverage for more than one vehicle per policy.' },
    ],
    benefits: [
      { name: 'Account manager', description: 'Simulated dedicated account manager for the business.' },
    ],
  },
];

const CL_PLANS: PlanSeed[] = [
  {
    name: 'Basic Plan',
    shortDescription: 'Essential coverage for your vehicle at an affordable price.',
    basePrice: 85000,
    currency: 'CLP',
    order: 1,
    recommended: false,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'Civil liability', description: 'Covers damage to third parties caused by your vehicle.' },
      { name: 'Roadside assistance', description: 'Basic towing and roadside mechanical assistance, available 24/7.' },
    ],
    benefits: [
      { name: 'Support line', description: 'Simulated 24/7 phone support.' },
    ],
  },
  {
    name: 'Essential Plus Plan',
    shortDescription: 'The right balance between price and coverage for everyday use.',
    basePrice: 120000,
    currency: 'CLP',
    order: 2,
    recommended: true,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'Extended civil liability', description: 'Higher coverage limit for third-party claims.' },
      { name: 'Partial damage', description: 'Covers collisions and partial damage to the insured vehicle.' },
      { name: 'Total theft', description: 'Simulated compensation in case of total vehicle theft.' },
    ],
    benefits: [
      { name: 'Replacement vehicle', description: 'Simulated replacement vehicle for up to 5 days.' },
      { name: 'Tire discount', description: '10% simulated discount at partner workshops.' },
    ],
  },
  {
    name: 'Premium Plan',
    shortDescription: 'Comprehensive all-risk coverage for maximum peace of mind.',
    basePrice: 210000,
    currency: 'CLP',
    order: 3,
    recommended: false,
    active: true,
    country: 'CL',
    coverages: [
      { name: 'All-risk', description: 'Broad coverage that includes damage to the insured vehicle itself.' },
      { name: 'Extended civil liability', description: 'Higher coverage limit for third-party claims.' },
      { name: 'Total and partial theft', description: 'Simulated compensation for total theft or stolen parts.' },
    ],
    benefits: [
      { name: 'Extended replacement vehicle', description: 'Simulated replacement vehicle for up to 15 days.' },
      { name: 'Designated driver', description: 'Simulated designated-driver service, 4 times a year.' },
      { name: 'Legal advice', description: 'Simulated legal guidance in case of a claim.' },
    ],
  },
  {
    name: 'Corporate Plan',
    shortDescription: 'Coverage for business fleets — coming soon.',
    basePrice: 390000,
    currency: 'CLP',
    order: 4,
    recommended: false,
    active: false,
    country: 'CL',
    coverages: [
      { name: 'Business fleet', description: 'Simulated coverage for more than one vehicle per policy.' },
    ],
    benefits: [
      { name: 'Account manager', description: 'Simulated dedicated account manager for the business.' },
    ],
  },
];

export const PLAN_SEEDS: PlanSeed[] = [...CO_PLANS, ...CL_PLANS];
