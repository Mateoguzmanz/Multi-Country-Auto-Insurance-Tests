import { Injectable, effect, signal } from '@angular/core';
import { CountryStore } from './country.store';
import type { Step1FormValue } from '../models/form-field.model';
import type {
  PaymentStatus,
  SelectedPlan,
  SimulatedPaymentResult,
  Step1Status,
  WizardState,
} from '../models/wizard.model';

const STORAGE_KEY = 'quote.wizard';

function createInitialState(): WizardState {
  return {
    step1: { value: {}, status: 'loading' },
    selectedPlan: null,
    terms: { accepted: false, acceptedVersion: null },
    payment: { status: 'idle', result: null },
  };
}

@Injectable({ providedIn: 'root' })
export class WizardStore {
  private readonly stateSignal = signal<WizardState>(readStoredState() ?? createInitialState());

  readonly state = this.stateSignal.asReadonly();

  constructor(private readonly countryStore: CountryStore) {
    effect(() => {
      persistState(this.stateSignal());
    });

    let previousCountry = this.countryStore.country();
    effect(() => {
      const country = this.countryStore.country();
      if (previousCountry !== null && country !== previousCountry) {
        this.stateSignal.set(createInitialState());
      }
      previousCountry = country;
    });
  }

  setStep1Value(value: Step1FormValue): void {
    this.stateSignal.update((state) => ({ ...state, step1: { ...state.step1, value } }));
  }

  setStep1Status(status: Step1Status): void {
    this.stateSignal.update((state) => ({ ...state, step1: { ...state.step1, status } }));
  }

  selectPlan(plan: SelectedPlan): void {
    this.stateSignal.update((state) => ({ ...state, selectedPlan: plan }));
  }

  clearSelectedPlan(): void {
    this.stateSignal.update((state) => ({ ...state, selectedPlan: null }));
  }

  acceptTerms(version: string): void {
    this.stateSignal.update((state) => ({
      ...state,
      terms: { accepted: true, acceptedVersion: version },
    }));
  }

  setPaymentStatus(status: PaymentStatus): void {
    this.stateSignal.update((state) => ({ ...state, payment: { ...state.payment, status } }));
  }

  setPaymentResult(result: SimulatedPaymentResult | null): void {
    this.stateSignal.update((state) => ({ ...state, payment: { ...state.payment, result } }));
  }

  reset(): void {
    this.stateSignal.set(createInitialState());
  }
}

function readStoredState(): WizardState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WizardState) : null;
  } catch {
    return null;
  }
}

function persistState(state: WizardState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable: wizard state won't survive a refresh in this session.
  }
}
