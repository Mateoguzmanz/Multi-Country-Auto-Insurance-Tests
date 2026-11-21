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
const SIMULATED_DECLINE_REASON = 'Simulated decline — this is a test-mode payment gateway, not a real one.';

/**
 * Never a real payment gateway. `submitPayment` resolves `approved` by default; passing
 * `simulateFailure: true` (specs/US-03-summary-payment.md, Phase 10 Resolutions) forces a
 * deterministic `rejected` result instead, driven by a second, clearly-labeled UI control
 * rather than a hidden trigger — this is a mock gateway, so a labeled simulation control
 * is an honest depiction of one, not a shortcut.
 */
@Injectable({ providedIn: 'root' })
export class SimulatedPaymentService {
  submitPayment(
    request: SimulatedPaymentRequest,
    simulateFailure = false,
  ): Observable<SimulatedPaymentResult> {
    return of(null).pipe(
      delay(SIMULATED_PROCESSING_DELAY_MS),
      map(() =>
        simulateFailure
          ? { status: 'rejected' as const, reason: SIMULATED_DECLINE_REASON }
          : {
              status: 'approved' as const,
              quoteNumber: generateQuoteNumber(request.country),
              processedAt: new Date().toISOString(),
            },
      ),
    );
  }
}
