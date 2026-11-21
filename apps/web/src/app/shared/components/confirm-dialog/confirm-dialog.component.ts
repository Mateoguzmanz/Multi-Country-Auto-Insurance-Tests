import { Component, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { translate, type TranslationKey } from '../../../core/i18n/translations';
import { LanguageStore } from '../../../core/state/language.store';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  private readonly languageStore = inject(LanguageStore);

  readonly message = input.required<string>();
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  t(key: TranslationKey): string {
    return translate(key, this.languageStore.language());
  }

  constructor() {
    // Focuses the safe ("cancel") action as soon as the dialog renders, so a stray Enter
    // key never confirms a destructive choice by accident.
    afterNextRender(() => this.cancelButton()?.nativeElement.focus());
  }

  onBackdropClick(): void {
    this.cancelled.emit();
  }
}
