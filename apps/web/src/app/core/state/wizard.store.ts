import { Injectable, computed, effect, signal } from '@angular/core';
import { CountryStore } from './country.store';
import { projectReservedStep1Fields } from '../forms/project-reserved-step1-fields';
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

  // Derived step-completion flags used by the wizard stepper to decide which steps are
  // safe to jump to directly (a step is only navigable once reached, never skipped ahead).
  readonly isStep1Complete = computed(
    () => projectReservedStep1Fields(this.stateSignal().step1.value) !== null,
  );
  readonly isStep2Complete = computed(() => this.stateSignal().selectedPlan !== null);

  // Once a payment is approved the whole quote is locked: there is no way back to steps 1
  // or 2, only starting an entirely new quote (see `reset()`).
  readonly isApproved = computed(() => this.stateSignal().payment.status === 'approved');

  // Whether any part of the current quote has been started — used to warn before an
  // action (e.g. switching country) that would silently discard it via `reset()`.
  readonly hasProgress = computed(() => {
    const state = this.stateSignal();
    return (
      Object.keys(state.step1.value).length > 0 ||
      state.selectedPlan !== null ||
      state.payment.status !== 'idle'
    );
  });

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

  setTermsAccepted(accepted: boolean, version: string | null): void {
    this.stateSignal.update((state) => ({
      ...state,
      terms: accepted
        ? { accepted: true, acceptedVersion: version }
        : { accepted: false, acceptedVersion: null },
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
