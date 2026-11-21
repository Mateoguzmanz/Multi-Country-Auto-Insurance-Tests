import { Routes } from '@angular/router';
import { QuoteFormPageComponent } from './features/quote/quote-form-page/quote-form-page.component';
import { QuotePlansPageComponent } from './features/quote/quote-plans-page/quote-plans-page.component';
import { QuoteSummaryPageComponent } from './features/quote/quote-summary-page/quote-summary-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'quote/form' },
  { path: 'quote/form', component: QuoteFormPageComponent },
  { path: 'quote/plans', component: QuotePlansPageComponent },
  { path: 'quote/summary', component: QuoteSummaryPageComponent },
];
