import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CountryContentService, type CountryContentState } from '../../../core/services/country-content.service';
import { CountryStore } from '../../../core/state/country.store';
import { SimulatedPaymentService } from '../../../core/services/simulated-payment.service';
import { WizardStore } from '../../../core/state/wizard.store';
import type { Step1FormValue } from '../../../core/models/form-field.model';
import type { SelectedPlan, SimulatedPaymentResult } from '../../../core/models/wizard.model';
import type { TermsAndConditionEntry } from '../../../core/models/terms.model';
import { QuoteSummaryPageComponent } from './quote-summary-page.component';

const STEP1_VALUE: Step1FormValue = {
  fullName: 'Jane Doe',
  documentType: 'CC',
  documentNumber: '1012345632',
  dateOfBirth: '1990-01-01',
  email: 'jane@example.com',
  phone: '3001234567',
  vehicleMake: 'Toyota',
  vehicleModel: 'Corolla',
  vehicleYear: 2020,
  vehicleIdentifier: 'ABC123',
  vehicleUsage: 'personal',
};

const SELECTED_PLAN: SelectedPlan = {
  id: 1,
  name: 'Basic',
  country: 'CO',
  finalPrice: 100_000,
  currency: 'COP',
  coverageSummary: ['Theft'],
};

const TERMS: TermsAndConditionEntry = {
  id: 1,
  documentId: 'terms-1',
  country: 'CO',
  version: 'v1',
  body: 'Sample terms body',
};

const TERMS_STATE: CountryContentState<TermsAndConditionEntry | null> = {
  data: TERMS,
  loading: false,
  error: null,
};

function createFixture(submitPayment: () => ReturnType<SimulatedPaymentService['submitPayment']>) {
  sessionStorage.clear();

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: CountryContentService,
        useValue: {
          getTerms: () => signal(TERMS_STATE).asReadonly(),
          refetchTerms: () => {},
        } satisfies Partial<CountryContentService>,
      },
      { provide: SimulatedPaymentService, useValue: { submitPayment } },
    ],
  });

  const countryStore = TestBed.inject(CountryStore);
  const wizardStore = TestBed.inject(WizardStore);

  countryStore.setCountry('CO');
  wizardStore.setStep1Value(STEP1_VALUE);
  wizardStore.selectPlan(SELECTED_PLAN);
  wizardStore.setTermsAccepted(true, 'v1');
  TestBed.tick();

  const fixture = TestBed.createComponent(QuoteSummaryPageComponent);
  fixture.detectChanges();
  TestBed.tick();

  return { fixture, wizardStore };
}

describe('QuoteSummaryPageComponent — rejected payment', () => {
  it('shows the error message, returns to a retryable state, and preserves all wizard data', () => {
    const rejected: SimulatedPaymentResult = { status: 'rejected', reason: 'The simulated gateway declined this payment.' };
    const { fixture, wizardStore } = createFixture(() => of(rejected));

    fixture.componentInstance.pay();
    fixture.detectChanges();
    TestBed.tick();

    expect(wizardStore.state().payment.status).toBe('rejected');
    expect(fixture.componentInstance.rejectedReason()).toBe('The simulated gateway declined this payment.');
    expect(fixture.componentInstance.canPay()).toBe(true);

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('The simulated gateway declined this payment.');

    expect(wizardStore.state().step1.value).toEqual(STEP1_VALUE);
    expect(wizardStore.state().selectedPlan).toEqual(SELECTED_PLAN);
    expect(wizardStore.state().terms).toEqual({ accepted: true, acceptedVersion: 'v1' });
  });
});

describe('QuoteSummaryPageComponent — "Simulate a declined payment" control', () => {
  it('drives the same rejected path as a real failure, using the real SimulatedPaymentService', () => {
    vi.useFakeTimers();

    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: CountryContentService,
          useValue: {
            getTerms: () => signal(TERMS_STATE).asReadonly(),
            refetchTerms: () => {},
          } satisfies Partial<CountryContentService>,
        },
      ],
    });

    const countryStore = TestBed.inject(CountryStore);
    const wizardStore = TestBed.inject(WizardStore);
    countryStore.setCountry('CO');
    wizardStore.setStep1Value(STEP1_VALUE);
    wizardStore.selectPlan(SELECTED_PLAN);
    wizardStore.setTermsAccepted(true, 'v1');
    TestBed.tick();

    const fixture = TestBed.createComponent(QuoteSummaryPageComponent);
    fixture.detectChanges();

    const declineButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.quote-summary-page__simulate-decline',
    );
    expect(declineButton).not.toBeNull();
    declineButton!.click();

    vi.advanceTimersByTime(1200);
    fixture.detectChanges();

    expect(wizardStore.state().payment.status).toBe('rejected');
    expect(fixture.componentInstance.canPay()).toBe(true);
    expect(wizardStore.state().selectedPlan).toEqual(SELECTED_PLAN);

    vi.useRealTimers();
  });
});

describe('QuoteSummaryPageComponent — approved payment', () => {
  it('locks the pay action and shows the confirmation', () => {
    const approved: SimulatedPaymentResult = {
      status: 'approved',
      quoteNumber: 'CO-2026000001',
      processedAt: '2026-01-01T00:00:00.000Z',
    };
    const { fixture, wizardStore } = createFixture(() => of(approved));

    fixture.componentInstance.pay();
    fixture.detectChanges();
    TestBed.tick();

    expect(wizardStore.state().payment.status).toBe('approved');
    expect(fixture.componentInstance.approvedQuoteNumber()).toBe('CO-2026000001');
    expect(fixture.componentInstance.canPay()).toBe(false);
  });
});
