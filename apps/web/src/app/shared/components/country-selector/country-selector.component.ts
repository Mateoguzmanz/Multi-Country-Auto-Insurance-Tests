import { Component, inject } from '@angular/core';
import { CountryStore } from '../../../core/state/country.store';
import { LanguageStore } from '../../../core/state/language.store';
import { translate } from '../../../core/i18n/translations';
import type { CountryCode } from '../../../core/models/country.model';

@Component({
  selector: 'app-country-selector',
  imports: [],
  templateUrl: './country-selector.component.html',
  styleUrl: './country-selector.component.scss',
})
export class CountrySelectorComponent {
  private readonly countryStore = inject(CountryStore);
  private readonly languageStore = inject(LanguageStore);

  readonly country = this.countryStore.country;

  readonly ariaLabel = () => translate('countrySelectorAriaLabel', this.languageStore.language());

  selectCountry(country: CountryCode): void {
    this.countryStore.setCountry(country);
  }
}
