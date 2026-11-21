import { Injectable, signal } from '@angular/core';
import type { Language } from '../models/language.model';

const STORAGE_KEY = 'quote.language';

// Controls only the static app chrome (buttons, headings, labels this app's own templates
// own) — never the Strapi-sourced business content (field labels, plan copy, terms), which
// stays in whatever language the business team configured it in for that country.
@Injectable({ providedIn: 'root' })
export class LanguageStore {
  private readonly languageSignal = signal<Language>(readStoredLanguage() ?? 'en');

  readonly language = this.languageSignal.asReadonly();

  setLanguage(language: Language): void {
    this.languageSignal.set(language);
    try {
      sessionStorage.setItem(STORAGE_KEY, language);
    } catch {
      // sessionStorage unavailable: the choice won't survive a refresh in this session.
    }
  }
}

function readStoredLanguage(): Language | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'es' ? stored : null;
  } catch {
    return null;
  }
}
