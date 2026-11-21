import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { translate, type TranslationKey } from '../../../core/i18n/translations';
import { WizardStore } from '../../../core/state/wizard.store';

type StepKey = 'form' | 'plans' | 'summary';

interface StepDefinition {
  key: StepKey;
  path: string;
  number: number;
  labelKey: TranslationKey;
}

const STEP_DEFINITIONS: StepDefinition[] = [
  { key: 'form', path: '/quote/form', number: 1, labelKey: 'stepYourDetails' },
  { key: 'plans', path: '/quote/plans', number: 2, labelKey: 'stepPlans' },
  { key: 'summary', path: '/quote/summary', number: 3, labelKey: 'stepSummary' },
];

export interface StepViewModel extends StepDefinition {
  isCurrent: boolean;
  isDone: boolean;
  canNavigate: boolean;
  label: string;
}

@Component({
  selector: 'app-quote-stepper',
  imports: [RouterLink],
  templateUrl: './quote-stepper.component.html',
  styleUrl: './quote-stepper.component.scss',
})
export class QuoteStepperComponent {
  private readonly router = inject(Router);
  private readonly wizardStore = inject(WizardStore);

  readonly ariaLabel = () => translate('stepperAriaLabel');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly currentStep = computed<StepKey>(() => {
    const url = this.currentUrl();
    if (url.includes('/quote/plans')) {
      return 'plans';
    }
    if (url.includes('/quote/summary')) {
      return 'summary';
    }
    return 'form';
  });

  // Only the current step and steps whose prerequisites are already satisfied are
  // navigable by click — this prevents jumping ahead to a step whose data doesn't exist
  // yet. `isDone` (used for the checkmark/connector display) deliberately excludes the
  // current step, but the summary step's prerequisites must still be checked directly —
  // nothing ever marks "summary" itself done, since it's the last step.
  readonly steps = computed<StepViewModel[]>(() => {
    const current = this.currentStep();
    const step1Done = this.wizardStore.isStep1Complete();
    const step2Done = this.wizardStore.isStep2Complete();
    // Once the payment is approved the quote is locked: steps 1 and 2 stay marked done for
    // display, but neither is navigable anymore — the only way forward is a new quote.
    const locked = this.wizardStore.isApproved();
    const readyByKey: Record<StepKey, boolean> = locked
      ? { form: false, plans: false, summary: true }
      : { form: true, plans: step1Done, summary: step1Done && step2Done };

    return STEP_DEFINITIONS.map((step) => {
      const isCurrent = step.key === current;
      const isDone =
        !isCurrent && ((step.key === 'form' && step1Done) || (step.key === 'plans' && step2Done));
      const canNavigate = isCurrent || readyByKey[step.key];
      return { ...step, isCurrent, isDone, canNavigate, label: translate(step.labelKey) };
    });
  });
}
