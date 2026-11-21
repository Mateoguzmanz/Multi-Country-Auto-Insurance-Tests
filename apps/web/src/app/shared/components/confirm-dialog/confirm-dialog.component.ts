import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { translate, type TranslationKey } from '../../../core/i18n/translations';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly message = input.required<string>();
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  t(key: TranslationKey): string {
    return translate(key);
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
