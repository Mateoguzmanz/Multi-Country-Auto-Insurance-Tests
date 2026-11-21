import type { CountryCode } from './country.model';
import type { Currency } from './plan.model';
import type { Step1FormValue } from './form-field.model';

export type Step1Status = 'loading' | 'error' | 'empty' | 'ready';

export interface Step1WizardState {
  value: Step1FormValue;
  status: Step1Status;
}

export interface SelectedPlan {
  id: number;
  name: string;
  country: CountryCode;
  finalPrice: number;
  currency: Currency;
  coverageSummary: string[];
}

export type PaymentStatus = 'idle' | 'submitting' | 'approved' | 'rejected';

export type SimulatedPaymentResult =
  | { status: 'approved'; quoteNumber: string; processedAt: string }
  | { status: 'rejected'; reason: string };

export interface PaymentWizardState {
  status: PaymentStatus;
  result: SimulatedPaymentResult | null;
}

export interface TermsWizardState {
  accepted: boolean;
  acceptedVersion: string | null;
}

export interface WizardState {
  step1: Step1WizardState;
  selectedPlan: SelectedPlan | null;
  terms: TermsWizardState;
  payment: PaymentWizardState;
}
