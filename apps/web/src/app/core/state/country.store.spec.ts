import { TestBed } from '@angular/core/testing';
import { CountryStore } from './country.store';

describe('CountryStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('setCountry updates the signal and persists to sessionStorage', () => {
    const store = TestBed.inject(CountryStore);

    store.setCountry('CO');

    expect(store.country()).toBe('CO');
    expect(sessionStorage.getItem('quote.country')).toBe('CO');
  });

  it('reads back null when no country was ever stored', () => {
    const store = TestBed.inject(CountryStore);

    expect(store.country()).toBeNull();
  });

  it('reads back null, not a crash, when sessionStorage holds an invalid value', () => {
    sessionStorage.setItem('quote.country', 'XX');

    const store = TestBed.inject(CountryStore);

    expect(store.country()).toBeNull();
  });
});
