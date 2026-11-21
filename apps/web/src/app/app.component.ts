import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CountrySelectorComponent } from './shared/components/country-selector/country-selector.component';
import { QuoteStepperComponent } from './shared/components/quote-stepper/quote-stepper.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CountrySelectorComponent, QuoteStepperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
