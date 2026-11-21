import type { CountryCode } from './country.model';
import type { StrapiRecord } from './strapi.model';

export interface TermsAndConditionAttributes {
  country: CountryCode;
  version: string;
  body: string;
}

export type TermsAndConditionEntry = StrapiRecord<TermsAndConditionAttributes>;
