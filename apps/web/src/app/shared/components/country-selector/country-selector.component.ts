import { Component, inject } from '@angular/core';
import { CountryStore } from '../../../core/state/country.store';
import type { CountryCode } from '../../../core/models/country.model';

@Component({
  selector: 'app-country-selector',
  imports: [],
  templateUrl: './country-selector.component.html',
  styleUrl: './country-selector.component.scss',
})
export class CountrySelectorComponent {
  private readonly countryStore = inject(CountryStore);

  readonly country = this.countryStore.country;

  selectCountry(country: CountryCode): void {
    this.countryStore.setCountry(country);
  }
}
