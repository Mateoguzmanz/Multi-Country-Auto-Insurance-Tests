import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Signal, effect, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { translate } from '../i18n/translations';
import { CountryStore } from '../state/country.store';
import type { CountryCode } from '../models/country.model';
import type { FormFieldEntry } from '../models/form-field.model';
import type { PlanEntry } from '../models/plan.model';
import type { StrapiCollectionResponse } from '../models/strapi.model';
import type { TermsAndConditionEntry } from '../models/terms.model';

export interface CountryContentState<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
}

@Injectable({ providedIn: 'root' })
export class CountryContentService {
  private readonly http = inject(HttpClient);
  private readonly countryStore = inject(CountryStore);

  private noCountrySelectedState<T>(): CountryContentState<T> {
    return { data: null, loading: false, error: translate('noCountrySelected') };
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return translate('failedToLoadContent');
  }

  private readonly formFieldsRefresh = signal(0);
  private readonly plansRefresh = signal(0);
  private readonly termsRefresh = signal(0);

  private readonly formFieldsState = this.createCountryScopedState<FormFieldEntry[]>(
    (country) =>
      this.http
        .get<StrapiCollectionResponse<FormFieldEntry>>(`${environment.strapiApiBaseUrl}/form-fields`, {
          params: new HttpParams()
            .set('filters[country][$eq]', country)
            .set('sort', 'order:asc,id:asc')
            .set('pagination[pageSize]', '100'),
        })
        .pipe(map((response) => response.data)),
    this.formFieldsRefresh,
  );

  private readonly plansState = this.createCountryScopedState<PlanEntry[]>(
    (country) =>
      this.http
        .get<StrapiCollectionResponse<PlanEntry>>(`${environment.strapiApiBaseUrl}/plans`, {
          params: new HttpParams()
            .set('filters[country][$eq]', country)
            .set('filters[active][$eq]', 'true')
            .set('sort', 'order:asc,id:asc')
            .set('populate', '*')
            .set('pagination[pageSize]', '100'),
        })
        .pipe(map((response) => response.data)),
    this.plansRefresh,
  );

  private readonly termsState = this.createCountryScopedState<TermsAndConditionEntry | null>(
    (country) =>
      this.http
        .get<StrapiCollectionResponse<TermsAndConditionEntry>>(
          `${environment.strapiApiBaseUrl}/terms-and-conditions`,
          {
            params: new HttpParams()
              .set('filters[country][$eq]', country)
              .set('sort', 'id:asc')
              .set('pagination[pageSize]', '1'),
          },
        )
        .pipe(map((response) => response.data[0] ?? null)),
    this.termsRefresh,
  );

  getFormFields(): Signal<CountryContentState<FormFieldEntry[]>> {
    return this.formFieldsState;
  }

  getPlans(): Signal<CountryContentState<PlanEntry[]>> {
    return this.plansState;
  }

  getTerms(): Signal<CountryContentState<TermsAndConditionEntry | null>> {
    return this.termsState;
  }

  /** Re-issues the form-fields request for the current country (e.g. after a load error). */
  refetchFormFields(): void {
    this.formFieldsRefresh.update((n) => n + 1);
  }

  /** Re-issues the plans request for the current country (e.g. after a load error). */
  refetchPlans(): void {
    this.plansRefresh.update((n) => n + 1);
  }

  /** Re-issues the terms request for the current country (e.g. after a load error). */
  refetchTerms(): void {
    this.termsRefresh.update((n) => n + 1);
  }

  private createCountryScopedState<T>(
    request: (country: CountryCode) => Observable<T>,
    refresh: Signal<number>,
  ): Signal<CountryContentState<T>> {
    const state = signal<CountryContentState<T>>(this.noCountrySelectedState<T>());
    let fetchedForCountry: CountryCode | null = null;
    let fetchedForRefreshToken: number | null = null;

    effect(() => {
      const country = this.countryStore.country();
      const refreshToken = refresh();

      if (!country) {
        fetchedForCountry = null;
        fetchedForRefreshToken = null;
        state.set(this.noCountrySelectedState<T>());
        return;
      }

      if (country === fetchedForCountry && refreshToken === fetchedForRefreshToken) {
        return;
      }

      fetchedForCountry = country;
      fetchedForRefreshToken = refreshToken;
      state.set({ data: null, loading: true, error: null });

      request(country).subscribe({
        next: (data) => state.set({ data, loading: false, error: null }),
        error: (error: unknown) =>
          state.set({ data: null, loading: false, error: this.toErrorMessage(error) }),
      });
    });

    return state.asReadonly();
  }
}
