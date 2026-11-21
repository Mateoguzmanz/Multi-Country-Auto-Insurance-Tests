import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { generateQuoteNumber } from '../payment/generate-quote-number';
import type { CountryCode } from '../models/country.model';
import type { SimulatedPaymentResult } from '../models/wizard.model';

export interface SimulatedPaymentRequest {
  quoteDraftId: string;
  amount: number;
  currency: string;
  country: CountryCode;
}

const SIMULATED_PROCESSING_DELAY_MS = 1200;

/**
 * Never a real payment gateway. The default path always resolves `approved`; the
 * "Rejected payment" scenario is exercised by stubbing/mocking `submitPayment` at the
 * test level (specs/US-03-summary-payment.md, Resolutions) — there is no real trigger for
 * a rejection in the app itself.
 */
@Injectable({ providedIn: 'root' })
export class SimulatedPaymentService {
  submitPayment(request: SimulatedPaymentRequest): Observable<SimulatedPaymentResult> {
    return of(null).pipe(
      delay(SIMULATED_PROCESSING_DELAY_MS),
      map(() => ({
        status: 'approved' as const,
        quoteNumber: generateQuoteNumber(request.country),
        processedAt: new Date().toISOString(),
      })),
    );
  }
}
