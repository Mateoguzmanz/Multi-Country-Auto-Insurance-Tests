import { Component, inject, signal } from '@angular/core';
import { CountryStore } from '../../../core/state/country.store';
import { WizardStore } from '../../../core/state/wizard.store';
import { translate } from '../../../core/i18n/translations';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import type { CountryCode } from '../../../core/models/country.model';

@Component({
  selector: 'app-country-selector',
  imports: [ConfirmDialogComponent],
  templateUrl: './country-selector.component.html',
  styleUrl: './country-selector.component.scss',
})
export class CountrySelectorComponent {
  private readonly countryStore = inject(CountryStore);
  private readonly wizardStore = inject(WizardStore);

  readonly country = this.countryStore.country;

  readonly ariaLabel = () => translate('countrySelectorAriaLabel');

  readonly confirmMessage = () => translate('confirmCountryChange');

  // The country awaiting confirmation, while the dialog is open — null the rest of the time.
  readonly pendingCountry = signal<CountryCode | null>(null);

  // Switching country silently discards the in-progress quote (see `WizardStore`'s
  // country-change effect), so this confirms first whenever there's actually something
  // to lose — no prompt when nothing has been filled in yet, or when re-picking the
  // already-active country.
  selectCountry(country: CountryCode): void {
    if (country === this.country()) {
      return;
    }
    if (this.wizardStore.hasProgress()) {
      this.pendingCountry.set(country);
      return;
    }
    this.countryStore.setCountry(country);
  }

  confirmPendingCountry(): void {
    const country = this.pendingCountry();
    if (country) {
      this.countryStore.setCountry(country);
    }
    this.pendingCountry.set(null);
  }

  cancelPendingCountry(): void {
    this.pendingCountry.set(null);
  }
}
