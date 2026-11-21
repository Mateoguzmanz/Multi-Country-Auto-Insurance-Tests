# US-03 — Summary and payment

Status: Approved

## Story

As a person who chose a plan, I want to review a summary of my quote and pay, so that I
become insured.

### Context

Before paying, the person must confirm their data and accept the terms and conditions,
whose text varies by country and is managed by the business team from Strapi. Payment is
simulated for this test.

## Business rules

- The summary shows the policyholder's data, the vehicle's data and the chosen plan with
  its final price.
- The document number is shown partially masked.
- From the summary the person can go back to edit their data or change the plan.
- The pay button is enabled only after accepting the terms and conditions.
- The payment cannot be submitted twice.
- On successful payment, a confirmation with a simulated quote number is shown.

## Acceptance criteria

```gherkin
Scenario: Complete summary
  Given I chose a plan
  When I reach the summary
  Then I see my data, my vehicle's data and the chosen plan with its final price

Scenario: Terms by country
  Given I am on the summary
  When I view the terms and conditions
  Then the text matches the one configured in Strapi for my country
  And the pay button is disabled until I accept them

Scenario: Successful payment
  Given I accepted the terms
  When I click pay
  Then the button is locked while the payment is processed
  And I see the confirmation with the quote number

Scenario: Rejected payment
  Given the simulated payment fails
  When I click pay
  Then I see a clear error message
  And I can try again without losing my information
```

## Gaps and edge cases

- **Document number masking (assumption, needs confirmation).** The story requires the
  document number to be "partially masked" but doesn't specify the pattern. Colombia's
  document number (cédula) is a plain digit string; Chile's RUT includes formatting
  (`12.345.678-9`). Proposed rule, to be applied uniformly regardless of country:
  - Take the raw identifier value as entered (ignoring separators for the purpose of
    counting).
  - Keep the first 2 characters and the last 2 characters visible.
  - Replace every character in between with `•`.
  - Re-apply the country's own display formatting (dots/dash for `CL`) around the masked
    result, so a RUT still reads as grouped, e.g. `12.•••.•••-9`, and a CO cédula reads as
    `10••••••32`.
  - If the raw value is 4 characters or fewer, mask everything except the last character
    only (avoids a fully-unmasked short number).
  This is flagged as an assumption — see Open questions.
- **Simulated payment failure condition (assumption, needs confirmation).** The story says
  "the simulated payment fails" without saying when. Proposed simulated approach, clearly
  labeled as a test-only mock (never a real gateway):
  - The mock payment step exposes a deterministic, user-visible toggle in the UI itself
    (e.g. a dev/test control, or a specific fictitious card number convention such as
    "card ending in 0000 always fails") rather than a hidden random chance, so the
    rejected-payment E2E scenario is reproducible and not flaky.
  - A fixed, small random-failure chance is explicitly rejected for the default path
    because it would make `test-writer`'s E2E "rejected payment" scenario non-deterministic.
  This is an assumption pending confirmation — see Open questions.
- **Double-submit prevention.** The pay action transitions a `payment.status` signal
  `idle → submitting` synchronously on click; the pay button is disabled (not just
  visually, but via the `disabled` attribute so it's also unreachable by keyboard/Enter)
  for the whole `submitting` state. A second click, a second Enter keypress, or a
  double-tap while `submitting` is a no-op. On `rejected`, status returns to `idle` so the
  person can retry; on `approved`, the button stays disabled/hidden (payment is final).
- **Quote number format (assumption, needs confirmation).** Proposed simulated format:
  `<country>-<yyyy><sequence or random 6 digits>`, e.g. `CO-2026384012`, generated entirely
  client-side (no backend) since persistence is simulated for this test. Flagged as an
  assumption — see Open questions.
- **Back-navigation preserves data.** Going back to edit policyholder/vehicle data (US-01)
  or to change the plan (US-02) must not clear any previously entered wizard state. Coming
  back to the summary afterward must re-render it from the preserved state, re-fetch the
  current country's terms and conditions, and reset `termsAccepted` to `false` only if the
  country changed (otherwise previously accepted terms for the same country/version stay
  accepted — see Open questions on whether re-acceptance should always be forced).
- **Loading / error / empty states for terms and conditions.** The terms content comes
  from Strapi (`terms-and-condition`, country-scoped per ADR-0001). The summary must
  handle: terms loading (pay button stays disabled while loading, spinner or skeleton
  shown), fetch error / Strapi unreachable (visible error message, a retry action, pay
  button stays disabled since terms can't be shown), and the case where no terms entry
  exists for the current country (same error handling — never silently accept with no
  content shown).
- **Offline / payment-network failure vs. simulated rejection.** The simulated payment
  failure (business scenario) is distinct from a genuine client-side error (e.g. the mock
  payment handler throwing). Both must surface a clear, user-facing error message per the
  "Rejected payment" scenario, but a genuine error should be logged distinctly (e.g. to the
  console) for debugging, without exposing technical detail to the user.
- **Session persistence / refresh mid-wizard.** Per the front-end-only persistence
  constraint, all wizard state (policyholder, vehicle, plan, terms acceptance, payment
  status/result) is kept in a signal-based store backed by `sessionStorage`, so a page
  refresh on the summary step restores the in-progress quote instead of losing it. Closing
  the tab (session end) is expected to lose the data — this is in scope as "front-end-only
  persistence", not durable storage.
- **Successful payment: wizard state afterward.** After an approved payment, the person is
  on a confirmation screen with the quote number. The "pay button is enabled only after
  accepting terms" and double-submit rules imply the summary form itself should no longer
  be editable/re-submittable from that point; navigating back should not resurrect a
  payable summary for an already-approved quote. Exact behavior (locked summary vs.
  redirect vs. new-quote reset) is an open question.
- **Accessibility.** The terms-and-conditions checkbox has a programmatically associated
  label and its own `aria-describedby` if paired with helper/error text; the pay button's
  `disabled` state is reflected to assistive tech (native `disabled`, not just a CSS
  class); the "submitting" state is announced (e.g. `aria-live` region) so screen-reader
  users know the click registered; on both approval and rejection, focus moves to the
  resulting message (confirmation panel or error alert) so it's immediately read out; the
  whole flow (checkbox, back links, pay button, retry action) is reachable and operable by
  keyboard alone, in a logical tab order.
- **Responsive layout.** Summary sections (policyholder, vehicle, plan/price, terms,
  pay action) must reflow for narrow viewports without requiring horizontal scrolling or
  truncating the final price/quote number.

## Data contract

The policyholder and vehicle shapes are owned by US-01's spec and the plan shape by
US-02's; they're restated here only as the shape US-03 *consumes*, so field names must be
reconciled with those specs once drafted (see Open questions). The terms-and-conditions
and simulated-payment shapes are introduced by this spec.

```ts
type CountryCode = 'CO' | 'CL';

// Consumed from US-01's wizard state. Field names are provisional pending that spec.
interface PolicyholderData {
  fullName: string;
  documentType: string;   // e.g. 'CC' for CO, 'RUT' for CL — country-specific, from Strapi form-field config
  documentNumber: string; // raw, unmasked; masking is applied only at render time in US-03
  email: string;
  phone: string;
}

// Consumed from US-01's wizard state. Field names are provisional pending that spec.
interface VehicleData {
  make: string;
  model: string;
  year: number;
  vehicleIdentifier: string; // country-specific label/validation, from Strapi form-field config
}

// Consumed from US-02's wizard state.
interface SelectedPlan {
  id: number; // Strapi's real numeric id — corrected in Phase 5, see Resolutions below
  name: string;
  country: CountryCode;
  finalPrice: number;
  currency: string; // 'COP' | 'CLP'
  coverageSummary: string[];
}

// Read-only Strapi content-type, country-scoped per ADR-0001, via CountryContentService.
interface TermsAndCondition {
  id: number;
  country: CountryCode;
  version: string;
  body: string; // rich text / markdown, rendered as-is
  updatedAt: string;
}

// Simulated only — never sent to a real payment gateway; fictitious data only.
interface SimulatedPaymentRequest {
  quoteDraftId: string;
  amount: number;
  currency: string;
}

type SimulatedPaymentResult =
  | { status: 'approved'; quoteNumber: string; processedAt: string }
  | { status: 'rejected'; reason: string };

// Front-end wizard state for this step, signals-backed and mirrored to sessionStorage.
interface SummaryStepState {
  country: CountryCode;
  policyholder: PolicyholderData;
  vehicle: VehicleData;
  plan: SelectedPlan;
  terms: {
    content: TermsAndCondition | null;
    loading: boolean;
    error: string | null;
    accepted: boolean;
    acceptedVersion: string | null;
  };
  payment: {
    status: 'idle' | 'submitting' | 'approved' | 'rejected';
    result: SimulatedPaymentResult | null;
  };
}
```

## Definition of done

- [ ] Summary renders the policyholder's data, vehicle's data and chosen plan with final
      price (**Complete summary**).
- [ ] Document number is shown using the masking rule above, never in full (**Complete
      summary**; cross-cutting security checklist item).
- [ ] "Edit data" and "change plan" actions return to US-01/US-02 without losing any
      previously entered wizard state, and coming back restores the summary correctly.
- [ ] Terms and conditions are fetched from Strapi through `CountryContentService`,
      filtered to the current country, and the rendered text matches that country's
      configured entry (**Terms by country**).
- [ ] Terms loading/error/empty states are handled explicitly; pay button stays disabled
      in all of them.
- [ ] Pay button is disabled until the terms checkbox is checked, and the disabled state
      is reflected to assistive tech (**Terms by country**).
- [ ] Clicking pay while terms are accepted locks the button for the duration of the
      (simulated) processing, and a second click/Enter during that window is a no-op
      (**Successful payment**; double-submit rule).
- [ ] A successful simulated payment shows a confirmation with a generated quote number,
      with focus moved to it (**Successful payment**).
- [ ] A failed simulated payment (per the proposed deterministic trigger, pending
      confirmation) shows a clear error message, returns the button to a retryable state,
      and preserves all previously entered data (**Rejected payment**).
- [ ] Full step is keyboard-operable (tab order, visible focus, no traps) and responsive at
      narrow viewports.
- [ ] No real payment gateway integration or real card data anywhere in this step; all
      payment data is clearly fictitious/simulated.

## Open questions

- Confirm the exact document-number masking pattern (first 2 / last 2 visible, as
  proposed) — is there a specific business/compliance-driven pattern expected instead?
- Confirm the simulated payment failure mechanism: deterministic UI toggle / fictitious
  "always-fails" card convention (proposed) vs. a different deterministic trigger. A pure
  random-chance failure is discouraged here because it would make the "Rejected payment"
  E2E scenario flaky, but confirm this reasoning is accepted.
- Confirm the quote number format (proposed: `<country>-<yyyy><6-digit random/sequence>`).
  Does it need to be guaranteed unique within a session, or is a random value acceptable
  for this simulated test?
- After an approved payment, should returning to the summary (e.g. via browser back) show
  a locked confirmation again, redirect to start a new quote, or something else? Not
  stated by the story.
- If the person changes country at any point before paying (e.g. by going back far enough
  to a country selector, if one exists per ADR-0001's "explicit, user-visible country
  selector"), must previously accepted terms be invalidated even if the wizard state for
  that step hasn't changed otherwise? Assumed yes (re-acceptance required per country), but
  not explicitly stated by the story.
- Exact field names/shapes for `PolicyholderData`, `VehicleData` and `SelectedPlan` depend
  on US-01's and US-02's specs, which are being drafted in parallel. This spec's data
  contract should be reconciled with theirs once finalized.

## Resolutions (approved 2026-11-21)

- **Document masking pattern**: accepted as proposed (first 2 / last 2 characters
  visible).
- **Simulated payment failure mechanism**: no user-facing "simulate failure" control in
  the UI. The default simulated payment path succeeds; the "Rejected payment" scenario is
  exercised deterministically at the test level by `test-writer` stubbing/mocking the
  payment service's response, so the e2e test is reliable without adding dev-only UI
  surface to the real flow. The payment integration itself stays a clearly-labeled
  simulated mock, never a real gateway.
- **Quote number format**: accepted as proposed (`<country>-<yyyy><6 digits>`), with no
  uniqueness guarantee required beyond the current session.
- **Post-approval summary behavior**: the confirmation screen is locked — navigating back
  after an approved payment does not resurrect a payable summary for that quote.
- **Re-acceptance of terms on country change**: required — changing country invalidates a
  prior terms acceptance.
- **Field reconciliation with US-01/US-02**: resolved via
  [ADR-0002](../docs/adr/0002-dynamic-form-rendering.md) — `PolicyholderData` and
  `VehicleData` here are the typed `ReservedStep1Fields` projection of US-01's dynamic
  `Step1FormValue`, read by reserved key (`fullName`, `documentType`, `documentNumber`,
  `email`, `phone`, `vehicleMake`, `vehicleModel`, `vehicleYear`, `vehicleIdentifier`),
  not a separately-defined shape.

## Resolutions (Phase 10 correction, 2026-11-21)

- **Simulated payment failure mechanism — superseding the resolution above.** Reversed:
  the UI now exposes a second, clearly-labeled control next to "Pay" — "Simulate a
  declined payment" — that drives the exact same flow but forces a `rejected` result.
  Rationale for the reversal: the entire payment step is already an explicitly simulated
  mock per the test's own rules (no real gateway is allowed at all), so a labeled
  simulation control isn't "dev-only UI clutter" the way it would be in a product with a
  real payment integration — it's an honest depiction of a mock/test gateway (the same
  pattern real payment providers use in their own test/sandbox modes, e.g. a specific
  test card number that always declines). The upside: every one of US-03's 4 Gherkin
  scenarios, including "Rejected payment," is now demonstrable by a human simply using
  the running app, not only provable by reading test code — directly relevant since part
  of this engagement's evaluation is a human using the application itself. The
  "Rejected payment" scenario is now covered primarily by a real Playwright e2e
  click-through (`test-writer`, Phase 10) rather than only a service-level mock.

## Resolutions (Phase 5 correction, 2026-11-21)

- **`SelectedPlan.id` corrected from `string` to `number`**: Strapi 5's real entity id is
  numeric (`PlanEntry.id`), not a string; the original guess was wrong. Corrected once
  `angular-builder` verified the live API in Phase 5. See US-02's matching correction
  note.
