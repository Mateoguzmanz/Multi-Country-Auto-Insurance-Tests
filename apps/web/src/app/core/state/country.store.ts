import { Injectable, signal } from '@angular/core';
import type { CountryCode } from '../models/country.model';

const STORAGE_KEY = 'quote.country';

@Injectable({ providedIn: 'root' })
export class CountryStore {
  private readonly countrySignal = signal<CountryCode | null>(readStoredCountry());

  readonly country = this.countrySignal.asReadonly();

  setCountry(country: CountryCode): void {
    this.countrySignal.set(country);
    try {
      sessionStorage.setItem(STORAGE_KEY, country);
    } catch {
      // sessionStorage unavailable: selection won't survive a refresh in this session.
    }
  }
}

function readStoredCountry(): CountryCode | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === 'CO' || stored === 'CL' ? stored : null;
  } catch {
    return null;
  }
}
