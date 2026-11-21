import { Component, computed, effect, inject, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { translate, type TranslationKey } from '../../../core/i18n/translations';
import { CountryContentService } from '../../../core/services/country-content.service';
import { CountryStore } from '../../../core/state/country.store';
import { WizardStore } from '../../../core/state/wizard.store';
import {
  applySimulatedPricingRule,
  extractPricingInputFromStep1,
  type SimulatedPricingRuleInput,
} from '../../../core/pricing/simulated-pricing-rule';
import type { CountryCode } from '../../../core/models/country.model';
import type { Currency, PlanDetailItem, PlanEntry } from '../../../core/models/plan.model';
import type { SelectedPlan } from '../../../core/models/wizard.model';

export interface PlanViewModel {
  id: number;
  name: string;
  shortDescription: string;
  adjustedPrice: number;
  formattedPrice: string;
  currency: Currency;
  coverages: PlanDetailItem[];
  benefits: PlanDetailItem[];
  recommended: boolean;
}

const LOCALE_BY_COUNTRY: Record<CountryCode, string> = {
  CO: 'es-CO',
  CL: 'es-CL',
};

function formatPrice(amount: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function toViewModel(entry: PlanEntry, pricingInput: SimulatedPricingRuleInput, locale: string): PlanViewModel {
  const adjustedPrice = applySimulatedPricingRule(entry.basePrice, pricingInput);

  return {
    id: entry.id,
    name: entry.name,
    shortDescription: entry.shortDescription,
    adjustedPrice,
    formattedPrice: formatPrice(adjustedPrice, entry.currency, locale),
    currency: entry.currency,
    coverages: entry.coverages,
    benefits: entry.benefits,
    recommended: entry.recommended,
  };
}

@Component({
  selector: 'app-quote-plans-page',
  imports: [RouterLink],
  templateUrl: './quote-plans-page.component.html',
  styleUrl: './quote-plans-page.component.scss',
})
export class QuotePlansPageComponent {
  private readonly countryContentService = inject(CountryContentService);
  private readonly countryStore = inject(CountryStore);
  private readonly wizardStore = inject(WizardStore);
  private readonly router = inject(Router);

  t(key: TranslationKey): string {
    return translate(key);
  }

  private readonly plansState = this.countryContentService.getPlans();

  readonly loading = computed(() => this.plansState().loading);
  readonly error = computed(() => this.plansState().error);

  readonly isNoCountrySelectedError = computed(() => this.error() === translate('noCountrySelected'));

  readonly isEmpty = computed(() => {
    const state = this.plansState();
    return !state.loading && !state.error && state.data !== null && state.data.length === 0;
  });

  readonly selectedPlanId = computed(() => this.wizardStore.state().selectedPlan?.id ?? null);

  readonly plans = computed<PlanViewModel[]>(() => {
    const entries = this.plansState().data ?? [];
    const country = this.countryStore.country();
    const locale = country ? LOCALE_BY_COUNTRY[country] : LOCALE_BY_COUNTRY.CO;
    const pricingInput = extractPricingInputFromStep1(this.wizardStore.state().step1.value);

    return entries.map((entry) => toViewModel(entry, pricingInput, locale));
  });

  constructor() {
    // Once a payment is approved the quote is locked — there's no way back to change the
    // plan, only starting a new quote (see `QuoteSummaryPageComponent.startNewQuote`).
    effect(() => {
      if (this.wizardStore.isApproved()) {
        this.router.navigate(['/quote/summary']);
      }
    });

    // Re-validates a persisted selection against the freshly fetched active+published
    // list whenever that list (re)loads — e.g. returning from the summary step or
    // re-entering after a stale sessionStorage restore. `untracked` keeps this from
    // re-running on every wizard-state change (e.g. a selection it just made).
    effect(() => {
      const state = this.plansState();
      if (state.loading || state.error || state.data === null) {
        return;
      }

      const data = state.data;
      const selected = untracked(() => this.wizardStore.state().selectedPlan);
      if (selected && !data.some((plan) => plan.id === selected.id)) {
        this.wizardStore.clearSelectedPlan();
      }
    });
  }

  selectPlan(plan: PlanViewModel): void {
    const country = this.countryStore.country();
    if (!country) {
      return;
    }

    const selected: SelectedPlan = {
      id: plan.id,
      name: plan.name,
      country,
      finalPrice: plan.adjustedPrice,
      currency: plan.currency,
      coverageSummary: plan.coverages.map((coverage) => coverage.name),
    };
    this.wizardStore.selectPlan(selected);
  }

  canContinue(): boolean {
    return this.selectedPlanId() !== null;
  }

  continue(): void {
    this.router.navigate(['/quote/summary']);
  }

  retry(): void {
    this.countryContentService.refetchPlans();
  }

  // See QuoteFormPageComponent.selectCountry: a plain "Retry" can't fix a missing
  // country, so the error state offers a direct one-click pick instead.
  selectCountry(country: CountryCode): void {
    this.countryStore.setCountry(country);
  }
}
