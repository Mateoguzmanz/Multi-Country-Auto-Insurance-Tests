import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { QuoteStepperComponent } from './quote-stepper.component';
import { WizardStore } from '../../../core/state/wizard.store';
import type { Step1FormValue } from '../../../core/models/form-field.model';
import type { SelectedPlan } from '../../../core/models/wizard.model';

const VALID_STEP1_VALUE: Step1FormValue = {
  fullName: 'Juan Pérez',
  documentType: 'CC',
  documentNumber: '1012345678',
  dateOfBirth: '1990-01-01',
  email: 'juan@example.com',
  phone: '3101234567',
  vehicleMake: 'Mazda',
  vehicleModel: 'CX-5',
  vehicleYear: 2021,
  vehicleIdentifier: 'ABC123',
  vehicleUsage: 'personal',
};

const SELECTED_PLAN: SelectedPlan = {
  id: 1,
  name: 'Essential Plus Plan',
  country: 'CO',
  finalPrice: 680000,
  currency: 'COP',
  coverageSummary: [],
};

async function createComponent(url: string) {
  TestBed.configureTestingModule({
    imports: [QuoteStepperComponent],
    providers: [
      provideRouter([
        { path: 'quote/form', component: QuoteStepperComponent },
        { path: 'quote/plans', component: QuoteStepperComponent },
        { path: 'quote/summary', component: QuoteStepperComponent },
      ]),
    ],
  });

  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);

  const fixture = TestBed.createComponent(QuoteStepperComponent);
  fixture.detectChanges();
  return { fixture, wizardStore: TestBed.inject(WizardStore) };
}

describe('QuoteStepperComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('on the form step, only the current step is navigable', async () => {
    const { fixture } = await createComponent('/quote/form');
    const steps = fixture.componentInstance.steps();

    expect(steps.find((step) => step.key === 'form')?.canNavigate).toBe(true);
    expect(steps.find((step) => step.key === 'plans')?.canNavigate).toBe(false);
    expect(steps.find((step) => step.key === 'summary')?.canNavigate).toBe(false);
  });

  it('marks step 1 as done and navigable once its data is complete, but keeps step 3 blocked without a plan', async () => {
    const { fixture, wizardStore } = await createComponent('/quote/plans');
    wizardStore.setStep1Value(VALID_STEP1_VALUE);
    fixture.detectChanges();

    const steps = fixture.componentInstance.steps();
    expect(steps.find((step) => step.key === 'form')?.isDone).toBe(true);
    expect(steps.find((step) => step.key === 'form')?.canNavigate).toBe(true);
    expect(steps.find((step) => step.key === 'summary')?.canNavigate).toBe(false);
  });

  it('unlocks the summary step once a plan has been selected', async () => {
    const { fixture, wizardStore } = await createComponent('/quote/plans');
    wizardStore.setStep1Value(VALID_STEP1_VALUE);
    wizardStore.selectPlan(SELECTED_PLAN);
    fixture.detectChanges();

    const steps = fixture.componentInstance.steps();
    expect(steps.find((step) => step.key === 'plans')?.isCurrent).toBe(true);
    expect(steps.find((step) => step.key === 'summary')?.canNavigate).toBe(true);
  });

  it('locks steps 1 and 2 once the payment is approved, leaving only summary navigable', async () => {
    const { fixture, wizardStore } = await createComponent('/quote/summary');
    wizardStore.setStep1Value(VALID_STEP1_VALUE);
    wizardStore.selectPlan(SELECTED_PLAN);
    wizardStore.setPaymentStatus('approved');
    fixture.detectChanges();

    const steps = fixture.componentInstance.steps();
    expect(steps.find((step) => step.key === 'form')?.canNavigate).toBe(false);
    expect(steps.find((step) => step.key === 'plans')?.canNavigate).toBe(false);
    expect(steps.find((step) => step.key === 'summary')?.canNavigate).toBe(true);
  });
});
