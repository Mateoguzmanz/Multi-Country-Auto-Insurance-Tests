import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import type { Subscription } from 'rxjs';
import { translate, type TranslationKey } from '../../../core/i18n/translations';
import { parseDateOnly } from '../../../core/formatting/parse-date-only';
import { CountryContentService } from '../../../core/services/country-content.service';
import { LanguageStore } from '../../../core/state/language.store';
import { WizardStore } from '../../../core/state/wizard.store';
import type {
  FormFieldConditionalRule,
  FormFieldEntry,
  FormFieldType,
  FormFieldValidation,
  FormFieldValue,
  Step1FormValue,
} from '../../../core/models/form-field.model';

type Step1FormGroup = FormGroup<Record<string, FormControl<FormFieldValue>>>;

export function defaultValueFor(type: FormFieldType): FormFieldValue {
  switch (type) {
    case 'checkbox':
      return false;
    case 'number':
      return null;
    default:
      return '';
  }
}

export function legalAgeValidator(): ValidatorFn {
  return (control: AbstractControl<FormFieldValue>): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }

    const dateOfBirth = parseDateOnly(value as string);
    if (Number.isNaN(dateOfBirth.getTime())) {
      return { legalAge: true };
    }

    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const birthdayPassedThisYear =
      today.getMonth() > dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
    if (!birthdayPassedThisYear) {
      age -= 1;
    }

    return age >= 18 ? null : { legalAge: true };
  };
}

export function buildValidators(field: FormFieldEntry, overrideValidation?: FormFieldValidation): ValidatorFn[] {
  const validators: ValidatorFn[] = [];

  if (field.required) {
    validators.push(field.type === 'checkbox' ? Validators.requiredTrue : Validators.required);
  }

  const validation = overrideValidation ?? field.validation;
  if (validation?.min !== undefined) {
    validators.push(Validators.min(validation.min));
  }
  if (validation?.max !== undefined) {
    validators.push(Validators.max(validation.max));
  }
  if (validation?.minLength !== undefined) {
    validators.push(Validators.minLength(validation.minLength));
  }
  if (validation?.maxLength !== undefined) {
    validators.push(Validators.maxLength(validation.maxLength));
  }
  if (validation?.pattern) {
    validators.push(Validators.pattern(validation.pattern));
  }

  if (field.key === 'dateOfBirth') {
    validators.push(legalAgeValidator());
  }

  return validators;
}

// Resolves a field's conditional rule (ADR-0002 follow-up: cross-field validation) against
// the current value of the sibling field it `dependsOnKey`s on. Returns null whenever there
// is nothing to override — the field has no dependency, the sibling has no value yet, or the
// sibling's current value has no matching entry — so callers fall back to the field's own
// base `validation`/`helpText`/`errorMessage`.
export function resolveConditionalRule(
  field: FormFieldEntry,
  siblingValue: FormFieldValue,
): FormFieldConditionalRule | null {
  if (!field.dependsOnKey || !field.validationByOption) {
    return null;
  }
  if (typeof siblingValue !== 'string' || siblingValue === '') {
    return null;
  }
  return field.validationByOption[siblingValue] ?? null;
}

export interface FieldLayoutGroups {
  leadingWide: FormFieldEntry[];
  normal: FormFieldEntry[];
  pair: FormFieldEntry[];
  trailingWide: FormFieldEntry[];
  checkbox: FormFieldEntry[];
}

// Splits a card's dynamic field list for a 3-column grid so every row uses exactly the
// space it needs, with no leftover empty columns — the field count and order come entirely
// from Strapi and can change at any time:
//   - checkboxes render on their own, pinned to the right (see the `--checkbox` modifier);
//   - `wideKeys` fields (e.g. the full name) always get their own full-width row up front;
//   - fields fill the grid 3-per-row as long as 3 or more remain;
//   - a row left with exactly 2 spans the full width split 50/50 (see `--pair`);
//   - a single trailing field left over spans the full width on its own (reuses `--wide`).
export function groupFieldsForLayout(fields: FormFieldEntry[], wideKeys: readonly string[] = []): FieldLayoutGroups {
  const checkbox = fields.filter((field) => field.type === 'checkbox');
  const leadingWide = fields.filter((field) => field.type !== 'checkbox' && wideKeys.includes(field.key));
  const regular = fields.filter((field) => field.type !== 'checkbox' && !wideKeys.includes(field.key));

  const remainder = regular.length % 3;
  const pair = remainder === 2 ? regular.slice(-2) : [];
  const trailingWide = remainder === 1 ? regular.slice(-1) : [];
  const trailingCount = pair.length + trailingWide.length;
  const normal = trailingCount > 0 ? regular.slice(0, regular.length - trailingCount) : regular;

  return { leadingWide, normal, pair, trailingWide, checkbox };
}

export function buildStep1FormGroup(fields: FormFieldEntry[], existingValue: Step1FormValue): Step1FormGroup {
  const group = new FormGroup<Record<string, FormControl<FormFieldValue>>>({});

  for (const field of fields) {
    const initialValue = existingValue[field.key] ?? defaultValueFor(field.type);
    group.addControl(
      field.key,
      new FormControl<FormFieldValue>(initialValue, { validators: buildValidators(field) }),
    );
  }

  return group;
}

@Component({
  selector: 'app-quote-form-page',
  imports: [ReactiveFormsModule, NgTemplateOutlet],
  templateUrl: './quote-form-page.component.html',
  styleUrl: './quote-form-page.component.scss',
})
export class QuoteFormPageComponent {
  private readonly countryContentService = inject(CountryContentService);
  private readonly wizardStore = inject(WizardStore);
  private readonly languageStore = inject(LanguageStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  t(key: TranslationKey): string {
    return translate(key, this.languageStore.language());
  }

  private readonly fieldsState = this.countryContentService.getFormFields();

  readonly loading = computed(() => this.fieldsState().loading);
  readonly error = computed(() => this.fieldsState().error);
  readonly fields = computed(() => this.fieldsState().data ?? []);

  readonly isEmpty = computed(() => {
    const state = this.fieldsState();
    return !state.loading && !state.error && state.data !== null && state.data.length === 0;
  });

  readonly form = signal<Step1FormGroup | null>(null);
  readonly submitted = signal(false);

  readonly hasAnyMisconfiguredSelect = computed(() =>
    this.fields().some((field) => this.hasMisconfiguredSelect(field)),
  );

  // Purely a presentational grouping, not a data-contract change. The split point is the
  // `order` of the first `vehicle*`-prefixed reserved field (ADR-0002): everything from
  // there on is the Vehicle card, everything before it is Policyholder. Using the business
  // team's own configured `order` (rather than matching each field's key) means a field
  // added later in the vehicle block — e.g. a city/region picker or an antitheft checkbox,
  // neither of which is itself `vehicle*`-prefixed — still lands in the right card.
  private readonly vehicleSectionStart = computed(() => {
    const vehicleOrders = this.fields()
      .filter((field) => field.key.startsWith('vehicle'))
      .map((field) => field.order);
    return vehicleOrders.length > 0 ? Math.min(...vehicleOrders) : null;
  });

  readonly policyholderFields = computed(() => {
    const start = this.vehicleSectionStart();
    return this.fields().filter((field) => start === null || field.order < start);
  });

  readonly vehicleFields = computed(() => {
    const start = this.vehicleSectionStart();
    return start === null ? [] : this.fields().filter((field) => field.order >= start);
  });

  readonly policyholderLayout = computed(() => groupFieldsForLayout(this.policyholderFields(), ['fullName']));
  readonly vehicleLayout = computed(() => groupFieldsForLayout(this.vehicleFields()));

  private formSubscriptionCleanup: (() => void) | null = null;

  constructor() {
    // Once a payment is approved the quote is locked — there's no way back to edit data,
    // only starting a new quote (see `QuoteSummaryPageComponent.startNewQuote`).
    effect(() => {
      if (this.wizardStore.isApproved()) {
        this.router.navigate(['/quote/summary']);
      }
    });

    effect(() => {
      const state = this.fieldsState();

      if (state.loading) {
        this.wizardStore.setStep1Status('loading');
        return;
      }

      if (state.error) {
        this.wizardStore.setStep1Status('error');
        this.form.set(null);
        return;
      }

      if (!state.data) {
        return;
      }

      if (state.data.length === 0) {
        this.wizardStore.setStep1Status('empty');
        this.form.set(null);
        return;
      }

      this.wizardStore.setStep1Status('ready');
      this.initializeForm(state.data);
    });

    this.destroyRef.onDestroy(() => this.formSubscriptionCleanup?.());
  }

  private initializeForm(fields: FormFieldEntry[]): void {
    const existingValue = untracked(() => this.wizardStore.state().step1.value);
    const group = buildStep1FormGroup(fields, existingValue);

    if (Object.keys(existingValue).length > 0) {
      group.markAllAsTouched();
    }

    this.formSubscriptionCleanup?.();
    const subscriptions: Subscription[] = [];

    subscriptions.push(
      group.valueChanges.subscribe((value) => {
        this.wizardStore.setStep1Value(value as Step1FormValue);
      }),
    );

    // Re-applies a dependent field's validators whenever the sibling field it depends on
    // changes — e.g. CL's `documentNumber` pattern switches between RUT and passport shape
    // as soon as `documentType` changes, without needing a page reload.
    for (const field of fields) {
      if (!field.dependsOnKey) {
        continue;
      }
      const dependentControl = group.controls[field.key];
      const siblingControl = group.controls[field.dependsOnKey];
      if (!dependentControl || !siblingControl) {
        continue;
      }

      const applyRule = (siblingValue: FormFieldValue) => {
        const rule = resolveConditionalRule(field, siblingValue);
        dependentControl.setValidators(buildValidators(field, rule ?? undefined));
        dependentControl.updateValueAndValidity({ emitEvent: false });
      };

      applyRule(siblingControl.value);
      subscriptions.push(siblingControl.valueChanges.subscribe(applyRule));
    }

    this.formSubscriptionCleanup = () => subscriptions.forEach((subscription) => subscription.unsubscribe());

    this.wizardStore.setStep1Value(group.getRawValue());
    this.form.set(group);
  }

  getControl(field: FormFieldEntry): FormControl<FormFieldValue> | undefined {
    return this.form()?.controls[field.key];
  }

  // `FormGroup.valid` mutates in place as controls change; it must be read directly
  // in a plain method (re-evaluated every change detection pass), not memoized via
  // `computed()`, which would only track the `form` signal reference itself.
  canContinue(): boolean {
    const form = this.form();
    return !!form && form.valid && !this.hasAnyMisconfiguredSelect();
  }

  hasMisconfiguredSelect(field: FormFieldEntry): boolean {
    return field.type === 'select' && (!field.options || field.options.length === 0);
  }

  showError(field: FormFieldEntry): boolean {
    const control = this.getControl(field);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  errorId(field: FormFieldEntry): string {
    return `field-${field.key}-error`;
  }

  helpId(field: FormFieldEntry): string {
    return `field-${field.key}-help`;
  }

  // Live positive feedback once a free-text/number field becomes valid — reuses whatever
  // pattern/length rules the business team already configured for that field and country,
  // rather than guessing at a single hardcoded field (e.g. the vehicle plate).
  isValid(field: FormFieldEntry): boolean {
    if (field.type === 'checkbox' || field.type === 'select') {
      return false;
    }
    const control = this.getControl(field);
    if (!control) {
      return false;
    }
    return control.valid && (control.dirty || control.touched) && control.value !== '' && control.value !== null;
  }

  describedBy(field: FormFieldEntry): string | null {
    const ids: string[] = [];
    if (this.effectiveHelpText(field)) {
      ids.push(this.helpId(field));
    }
    if (this.showError(field)) {
      ids.push(this.errorId(field));
    }
    return ids.length > 0 ? ids.join(' ') : null;
  }

  // The effective help/error text for a field, honoring its conditional rule (if any) for
  // the sibling field's current value — otherwise its own base Strapi-configured text.
  effectiveHelpText(field: FormFieldEntry): string | null {
    return this.resolveRuleForField(field)?.helpText ?? field.helpText;
  }

  effectiveErrorMessage(field: FormFieldEntry): string {
    return this.resolveRuleForField(field)?.errorMessage ?? field.errorMessage;
  }

  private resolveRuleForField(field: FormFieldEntry): FormFieldConditionalRule | null {
    if (!field.dependsOnKey) {
      return null;
    }
    const siblingValue = this.form()?.controls[field.dependsOnKey]?.value ?? null;
    return resolveConditionalRule(field, siblingValue);
  }

  retry(): void {
    this.countryContentService.refetchFormFields();
  }

  onSubmit(): void {
    this.submitted.set(true);
    const form = this.form();
    if (!form || form.invalid || this.hasAnyMisconfiguredSelect()) {
      form?.markAllAsTouched();
      return;
    }

    this.wizardStore.setStep1Value(form.getRawValue());
    this.router.navigate(['/quote/plans']);
  }
}
