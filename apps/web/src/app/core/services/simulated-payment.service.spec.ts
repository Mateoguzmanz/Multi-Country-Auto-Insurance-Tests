import { TestBed } from '@angular/core/testing';
import { SimulatedPaymentService } from './simulated-payment.service';
import type { SimulatedPaymentResult } from '../models/wizard.model';

describe('SimulatedPaymentService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves approved with a matching quote number only after the simulated delay', () => {
    const service = TestBed.inject(SimulatedPaymentService);
    let result: SimulatedPaymentResult | undefined;

    service
      .submitPayment({ quoteDraftId: 'CO-1', amount: 100_000, currency: 'COP', country: 'CO' })
      .subscribe((value) => (result = value));

    expect(result).toBeUndefined();

    vi.advanceTimersByTime(1200);

    expect(result).toBeDefined();
    expect(result!.status).toBe('approved');
    if (result!.status === 'approved') {
      expect(result!.quoteNumber).toMatch(/^CO-\d{10}$/);
    }
  });

  it('resolves rejected when simulateFailure is requested, driving the "Simulate a declined payment" control', () => {
    const service = TestBed.inject(SimulatedPaymentService);
    let result: SimulatedPaymentResult | undefined;

    service
      .submitPayment({ quoteDraftId: 'CO-1', amount: 100_000, currency: 'COP', country: 'CO' }, true)
      .subscribe((value) => (result = value));

    vi.advanceTimersByTime(1200);

    expect(result).toEqual({ status: 'rejected', reason: expect.any(String) });
  });
});
