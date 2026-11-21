import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { translate, type TranslationKey } from '../../../core/i18n/translations';
import { CountryContentService } from '../../../core/services/country-content.service';
import { CountryStore } from '../../../core/state/country.store';
import { LanguageStore } from '../../../core/state/language.store';
import { SimulatedPaymentService } from '../../../core/services/simulated-payment.service';
import { WizardStore } from '../../../core/state/wizard.store';
import { maskDocumentNumber } from '../../../core/formatting/mask-document-number';
import { projectReservedStep1Fields } from '../../../core/forms/project-reserved-step1-fields';
import type { CountryCode } from '../../../core/models/country.model';
import type { Currency } from '../../../core/models/plan.model';

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

@Component({
  selector: 'app-quote-summary-page',
  imports: [RouterLink],
  templateUrl: './quote-summary-page.component.html',
  styleUrl: './quote-summary-page.component.scss',
})
export class QuoteSummaryPageComponent {
  private readonly wizardStore = inject(WizardStore);
  private readonly countryContentService = inject(CountryContentService);
  private readonly countryStore = inject(CountryStore);
  private readonly languageStore = inject(LanguageStore);
  private readonly simulatedPaymentService = inject(SimulatedPaymentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  t(key: TranslationKey): string {
    return translate(key, this.languageStore.language());
  }

  private readonly termsState = this.countryContentService.getTerms();

  readonly country = this.countryStore.country;
  readonly policyholder = computed(() => projectReservedStep1Fields(this.wizardStore.state().step1.value));
  readonly plan = computed(() => this.wizardStore.state().selectedPlan);

  readonly maskedDocumentNumber = computed(() => {
    const fields = this.policyholder();
    const country = this.country();
    return fields && country ? maskDocumentNumber(fields.documentNumber, country) : '';
  });

  readonly formattedPrice = computed(() => {
    const plan = this.plan();
    const country = this.country();
    if (!plan || !country) {
      return '';
    }
    return formatPrice(plan.finalPrice, plan.currency, LOCALE_BY_COUNTRY[country]);
  });

  readonly termsLoading = computed(() => this.termsState().loading);
  readonly termsError = computed(() => this.termsState().error);
  readonly termsContent = computed(() => this.termsState().data);

  readonly isTermsAccepted = computed(() => {
    const terms = this.wizardStore.state().terms;
    const content = this.termsContent();
    return terms.accepted && content !== null && terms.acceptedVersion === content.version;
  });

  readonly paymentStatus = computed(() => this.wizardStore.state().payment.status);
  private readonly paymentResult = computed(() => this.wizardStore.state().payment.result);

  readonly isSubmitting = computed(() => this.paymentStatus() === 'submitting');
  readonly isApproved = computed(() => this.paymentStatus() === 'approved');

  readonly today = computed(() => {
    const country = this.country();
    const locale = country ? LOCALE_BY_COUNTRY[country] : LOCALE_BY_COUNTRY.CO;
    return new Date().toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  readonly approvedQuoteNumber = computed(() => {
    const result = this.paymentResult();
    return result?.status === 'approved' ? result.quoteNumber : null;
  });

  readonly rejectedReason = computed(() => {
    const result = this.paymentResult();
    return result?.status === 'rejected' ? result.reason : null;
  });

  readonly canPay = computed(
    () =>
      this.isTermsAccepted() &&
      !this.termsLoading() &&
      !this.termsError() &&
      this.paymentStatus() !== 'submitting' &&
      this.paymentStatus() !== 'approved',
  );

  readonly confirmationPanel = viewChild<ElementRef<HTMLElement>>('confirmationPanel');
  readonly errorPanel = viewChild<ElementRef<HTMLElement>>('errorPanel');

  constructor() {
    // A direct link to this step without completed prior steps never renders a broken
    // summary; once a payment is approved the screen is locked and this guard no longer
    // applies, since the data it would otherwise redirect for is still intact.
    effect(() => {
      const state = this.wizardStore.state();
      if (state.payment.status === 'approved') {
        return;
      }
      if (projectReservedStep1Fields(state.step1.value) === null) {
        this.router.navigate(['/quote/form']);
        return;
      }
      if (state.selectedPlan === null) {
        this.router.navigate(['/quote/plans']);
      }
    });

    afterRenderEffect(() => {
      const status = this.paymentStatus();
      if (status === 'approved') {
        this.confirmationPanel()?.nativeElement.focus();
      } else if (status === 'rejected') {
        this.errorPanel()?.nativeElement.focus();
      }
    });
  }

  onTermsCheckboxChange(checked: boolean): void {
    const content = this.termsContent();
    this.wizardStore.setTermsAccepted(checked, checked ? (content?.version ?? null) : null);
  }

  retryTerms(): void {
    this.countryContentService.refetchTerms();
  }

  downloadReceipt(): void {
    window.print();
  }

  startNewQuote(): void {
    this.wizardStore.reset();
    this.router.navigate(['/quote/form']);
  }

  pay(simulateFailure = false): void {
    if (!this.canPay()) {
      return;
    }

    const plan = this.plan();
    const country = this.country();
    if (!plan || !country) {
      return;
    }

    this.wizardStore.setPaymentStatus('submitting');
    this.wizardStore.setPaymentResult(null);

    this.simulatedPaymentService
      .submitPayment(
        {
          quoteDraftId: `${country}-${plan.id}`,
          amount: plan.finalPrice,
          currency: plan.currency,
          country,
        },
        simulateFailure,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.wizardStore.setPaymentResult(result);
          this.wizardStore.setPaymentStatus(result.status);
        },
        error: (error: unknown) => {
          console.error('Simulated payment request failed', error);
          this.wizardStore.setPaymentResult({
            status: 'rejected',
            reason: 'We could not process the payment. Please try again.',
          });
          this.wizardStore.setPaymentStatus('rejected');
        },
      });
  }
}
