import { Component, inject } from '@angular/core';
import { LanguageStore } from '../../../core/state/language.store';
import { translate } from '../../../core/i18n/translations';
import type { Language } from '../../../core/models/language.model';

@Component({
  selector: 'app-language-selector',
  imports: [],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  private readonly languageStore = inject(LanguageStore);

  readonly language = this.languageStore.language;

  readonly ariaLabel = () => translate('languageSelectorAriaLabel', this.language());

  selectLanguage(language: Language): void {
    this.languageStore.setLanguage(language);
  }
}
