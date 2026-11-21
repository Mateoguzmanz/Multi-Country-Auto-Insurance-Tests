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
import { parseDateOnly } from '../../../core/formatting/parse-date-only';
import { CountryContentService } from '../../../core/services/country-content.service';
import { WizardStore } from '../../../core/state/wizard.store';
import type {
  FormFieldEntry,
  FormFieldType,
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

export function buildValidators(field: FormFieldEntry): ValidatorFn[] {
  const validators: ValidatorFn[] = [];

  if (field.required) {
    validators.push(field.type === 'checkbox' ? Validators.requiredTrue : Validators.required);
  }

  const validation = field.validation;
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
  imports: [ReactiveFormsModule],
  templateUrl: './quote-form-page.component.html',
  styleUrl: './quote-form-page.component.scss',
})
export class QuoteFormPageComponent {
  private readonly countryContentService = inject(CountryContentService);
  private readonly wizardStore = inject(WizardStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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

  private formSubscriptionCleanup: (() => void) | null = null;

  constructor() {
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
    const subscription = group.valueChanges.subscribe((value) => {
      this.wizardStore.setStep1Value(value as Step1FormValue);
    });
    this.formSubscriptionCleanup = () => subscription.unsubscribe();

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

  describedBy(field: FormFieldEntry): string | null {
    const ids: string[] = [];
    if (field.helpText) {
      ids.push(this.helpId(field));
    }
    if (this.showError(field)) {
      ids.push(this.errorId(field));
    }
    return ids.length > 0 ? ids.join(' ') : null;
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
