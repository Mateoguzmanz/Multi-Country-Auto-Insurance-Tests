import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CountrySelectorComponent } from './shared/components/country-selector/country-selector.component';
import { LanguageSelectorComponent } from './shared/components/language-selector/language-selector.component';
import { QuoteStepperComponent } from './shared/components/quote-stepper/quote-stepper.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CountrySelectorComponent, LanguageSelectorComponent, QuoteStepperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
