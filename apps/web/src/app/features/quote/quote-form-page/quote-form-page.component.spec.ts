import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { CountryContentService, type CountryContentState } from '../../../core/services/country-content.service';
import type { FormFieldEntry } from '../../../core/models/form-field.model';
import { buildValidators, legalAgeValidator, QuoteFormPageComponent } from './quote-form-page.component';

function makeField(overrides: Partial<FormFieldEntry> = {}): FormFieldEntry {
  return {
    id: 1,
    documentId: 'doc-1',
    key: 'sampleField',
    label: 'Sample field',
    type: 'text',
    required: false,
    validation: null,
    helpText: null,
    errorMessage: 'Invalid value',
    order: 1,
    country: 'CO',
    options: null,
    ...overrides,
  };
}

describe('legalAgeValidator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a date of birth that turns exactly 18 today', () => {
    const control = new FormControl<string | null>('2008-06-15');

    expect(legalAgeValidator()(control)).toBeNull();
  });

  it('rejects a date of birth that is one day short of turning 18', () => {
    const control = new FormControl<string | null>('2008-06-16');

    expect(legalAgeValidator()(control)).toEqual({ legalAge: true });
  });

  it('passes through an empty value (required is a separate validator)', () => {
    const control = new FormControl<string | null>('');

    expect(legalAgeValidator()(control)).toBeNull();
  });
});

describe('buildValidators', () => {
  it('maps a configured min to a Validators.min violation', () => {
    const field = makeField({ type: 'number', validation: { min: 1990 } });
    const control = new FormControl<number | string | boolean | null>(1980, { validators: buildValidators(field) });

    expect(control.hasError('min')).toBe(true);
    control.setValue(2000);
    expect(control.valid).toBe(true);
  });

  it('maps a configured max to a Validators.max violation', () => {
    const field = makeField({ type: 'number', validation: { max: 2026 } });
    const control = new FormControl<number | string | boolean | null>(2027, { validators: buildValidators(field) });

    expect(control.hasError('max')).toBe(true);
    control.setValue(2026);
    expect(control.valid).toBe(true);
  });

  it('maps a configured pattern to a Validators.pattern violation', () => {
    const field = makeField({ type: 'text', validation: { pattern: '^[A-Z]{3}$' } });
    const control = new FormControl<number | string | boolean | null>('abc', { validators: buildValidators(field) });

    expect(control.hasError('pattern')).toBe(true);
    control.setValue('ABC');
    expect(control.valid).toBe(true);
  });
});

describe('QuoteFormPageComponent', () => {
  function createComponent(fieldsState: CountryContentState<FormFieldEntry[]>) {
    const fieldsSignal = signal(fieldsState);
    const countryContentServiceStub: Partial<CountryContentService> = {
      getFormFields: () => fieldsSignal.asReadonly(),
      refetchFormFields: () => {},
    };

    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CountryContentService, useValue: countryContentServiceStub }],
    });

    const fixture = TestBed.createComponent(QuoteFormPageComponent);
    TestBed.tick();
    return fixture;
  }

  it('flags a select field with no configured options as misconfigured', () => {
    const fixture = createComponent({ data: [], loading: false, error: null });
    const field = makeField({ type: 'select', options: [] });

    expect(fixture.componentInstance.hasMisconfiguredSelect(field)).toBe(true);
  });

  it('does not flag a select field that has configured options', () => {
    const fixture = createComponent({ data: [], loading: false, error: null });
    const field = makeField({ type: 'select', options: [{ label: 'A', value: 'a' }] });

    expect(fixture.componentInstance.hasMisconfiguredSelect(field)).toBe(false);
  });

  it('does not flag a non-select field regardless of options', () => {
    const fixture = createComponent({ data: [], loading: false, error: null });
    const field = makeField({ type: 'text', options: null });

    expect(fixture.componentInstance.hasMisconfiguredSelect(field)).toBe(false);
  });
});
