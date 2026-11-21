import { TestBed } from '@angular/core/testing';
import { CountryStore } from './country.store';
import { WizardStore } from './wizard.store';
import type { SelectedPlan } from '../models/wizard.model';

const PLAN: SelectedPlan = {
  id: 1,
  name: 'Basic',
  country: 'CO',
  finalPrice: 100_000,
  currency: 'COP',
  coverageSummary: ['Theft'],
};

describe('WizardStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('setStep1Value and setStep1Status update state', () => {
    const store = TestBed.inject(WizardStore);

    store.setStep1Value({ fullName: 'Jane Doe' });
    store.setStep1Status('ready');

    expect(store.state().step1.value).toEqual({ fullName: 'Jane Doe' });
    expect(store.state().step1.status).toBe('ready');
  });

  it('selectPlan and clearSelectedPlan update state', () => {
    const store = TestBed.inject(WizardStore);

    store.selectPlan(PLAN);
    expect(store.state().selectedPlan).toEqual(PLAN);

    store.clearSelectedPlan();
    expect(store.state().selectedPlan).toBeNull();
  });

  it('setTermsAccepted supports both accepting and un-accepting', () => {
    const store = TestBed.inject(WizardStore);

    store.setTermsAccepted(true, 'v1');
    expect(store.state().terms).toEqual({ accepted: true, acceptedVersion: 'v1' });

    store.setTermsAccepted(false, null);
    expect(store.state().terms).toEqual({ accepted: false, acceptedVersion: null });
  });

  it('setPaymentStatus and setPaymentResult update state', () => {
    const store = TestBed.inject(WizardStore);

    store.setPaymentStatus('submitting');
    expect(store.state().payment.status).toBe('submitting');

    store.setPaymentResult({ status: 'approved', quoteNumber: 'CO-2026000001', processedAt: '2026-01-01T00:00:00.000Z' });
    expect(store.state().payment.result).toEqual({
      status: 'approved',
      quoteNumber: 'CO-2026000001',
      processedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('persists state to sessionStorage', () => {
    const store = TestBed.inject(WizardStore);

    store.setStep1Value({ fullName: 'Jane Doe' });
    TestBed.tick();

    const raw = sessionStorage.getItem('quote.wizard');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).step1.value).toEqual({ fullName: 'Jane Doe' });
  });

  it('resets state when the country changes, but not on the initial selection', () => {
    const countryStore = TestBed.inject(CountryStore);
    const store = TestBed.inject(WizardStore);

    store.setStep1Value({ fullName: 'Jane Doe' });
    TestBed.tick();

    // The very first country selection (null -> 'CO') must not wipe step-1 data.
    countryStore.setCountry('CO');
    TestBed.tick();
    expect(store.state().step1.value).toEqual({ fullName: 'Jane Doe' });

    // Changing to a different country afterward must reset the wizard.
    countryStore.setCountry('CL');
    TestBed.tick();
    expect(store.state().step1.value).toEqual({});
    expect(store.state().selectedPlan).toBeNull();
  });
});
