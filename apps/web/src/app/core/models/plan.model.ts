import type { CountryCode } from './country.model';
import type { StrapiRecord } from './strapi.model';

export type Currency = 'COP' | 'CLP';

export interface PlanDetailItem {
  id: number;
  name: string;
  description: string;
}

export interface PlanAttributes {
  name: string;
  shortDescription: string;
  basePrice: number;
  currency: Currency;
  coverages: PlanDetailItem[];
  benefits: PlanDetailItem[];
  order: number;
  recommended: boolean;
  active: boolean;
  country: CountryCode;
}

export type PlanEntry = StrapiRecord<PlanAttributes>;
