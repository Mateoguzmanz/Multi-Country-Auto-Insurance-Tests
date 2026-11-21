# US-02 — Plan list

Status: Approved

## Story

As a person getting a quote, I want to see the plans available for my country with their
price and coverages, so that I can choose the one that best fits my needs.

### Context

Plans, coverages, benefits and prices change by country and are managed by the business
team from Strapi. The business team wants to highlight one plan as "recommended" and
control the order in which plans appear.

## Business rules

- Each plan is configured in Strapi with: name, short description, base price, currency,
  coverages, benefits, order, recommended flag, active status and country.
- Only published and active plans for the country are shown.
- The price is shown in the country's currency and format (Colombian pesos or Chilean
  pesos).
- The final price may be adjusted by a simulated rule based on the step 1 data. The rule is
  documented.
- Only one plan can be selected.

## Acceptance criteria

```gherkin
Scenario: Plans for the country
  Given I completed the step 1 form
  When I reach the plans step
  Then I see only the active and published plans for my country, in the configured order

Scenario: Recommended plan
  Given a plan is marked as recommended in Strapi
  When I view the plan list
  Then that plan is visually distinguished from the others

Scenario: Plan selection
  Given I am on the plan list
  When I select a plan
  Then it is marked as chosen
  And I can move on to the summary

Scenario: No plans available
  Given there are no active plans for my country
  When I reach the plans step
  Then I see a message explaining that no plans are available
```

## Gaps and edge cases

- **Loading state.** While the `plan` collection is being fetched, the plans step shows an
  explicit loading indicator instead of an empty list; plan selection controls are disabled
  until data arrives.
- **Error state vs. empty state.** "No plans available" (a business/content condition —
  the country simply has zero active+published plans) must be visually and textually
  distinct from a technical failure (Strapi unreachable, non-2xx response, network error).
  The technical-error state offers a retry action; the empty-content state does not (there
  is nothing to retry — it reflects actual content state).
- **Copy for the empty-content message is CMS-managed, not hardcoded.** Per `CLAUDE.md`,
  all country-specific copy lives in Strapi. This spec does not hardcode the "no plans
  available" sentence in Angular; the exact copy source is an open question below.
- **Country filter enforcement.** The plans request goes exclusively through the
  `CountryContentService` (ADR-0001) so the `country` filter can never be omitted at the
  call site. The request additionally filters `active=true` and relies on the Public role
  only exposing published entries (`find`/`findOne`), so no explicit "published" filter is
  needed beyond what the Public role already enforces.
- **Ordering and ties.** Plans are sorted by the Strapi `order` field ascending. If two
  plans share the same `order` value, the sort falls back to ascending `id` for a stable,
  deterministic order (see Open questions — needs confirmation this is the desired
  tie-break rather than a content-validation rule that forbids duplicate `order` values).
- **Multiple "recommended" plans.** Strapi does not enforce uniqueness on the `recommended`
  boolean. If the business team marks more than one plan as recommended, Angular renders
  the badge on every plan flagged `recommended` — it does not silently pick one. This is
  treated as a content-governance concern, not a front-end bug (see Open questions).
- **Currency formatting differs CO vs. CL.** Both Colombian pesos (COP) and Chilean pesos
  (CLP) are conventionally displayed with zero decimal places and a thousands separator
  (e.g. `$ 1.250.000`), but grouping separators and symbol placement follow each locale's
  convention (`es-CO` vs. `es-CL`). Formatting uses `Intl.NumberFormat` with the locale
  derived from the plan's `country`, not from the browser locale, so the amount always
  renders in the country's own convention regardless of the viewer's device settings.
- **Coverages/benefits can be empty.** If a plan's `coverages` or `benefits` array is
  empty, the corresponding section is omitted rather than rendered as an empty list or
  placeholder text.
- **Selection is exclusive.** Selecting a plan deselects any previously selected plan in
  the same step (single-select, radio-group semantics), per "Only one plan can be
  selected."
- **Back-navigation from the summary (step 3) to the plans step.** On returning to the
  plans step, the list of active+published plans for the country is re-fetched (content
  may have changed since the user last viewed it). The previous selection is preserved only
  if that same plan `id` is still present in the freshly fetched, active+published list;
  otherwise the selection is cleared and the user must choose again before advancing — the
  UI does not silently auto-select a different plan on the user's behalf.
- **Back-navigation from the plans step to step 1.** If the user changes step-1 answers
  that feed the simulated pricing rule (see Data contract) and returns to the plans step,
  every plan's displayed price is recomputed from the (possibly) new step-1 data; the base
  prices themselves are unchanged, only the simulated adjustment is reapplied.
- **Accessibility.** Each plan is a keyboard-operable selectable control (reachable by Tab,
  selectable with Enter/Space, visible focus indicator), consistent with `CLAUDE.md`. The
  "recommended" distinction is conveyed through more than color/an icon alone (e.g. a
  visually-rendered "Recommended" label plus a programmatic cue such as `aria-label` or
  visually-hidden text), so it is not lost to screen-reader users or color-blind users.
- **Responsive layout.** Plan cards stack in a single column on narrow viewports; price,
  "recommended" badge and the selection control all remain visible and legible without
  horizontal scrolling.
- **No pagination assumed.** The spec assumes the number of active plans per country is
  small enough to render in a single, unpaginated list. If the business team configures a
  large number of plans, pagination/virtualization is out of scope for this story
  (flagged, not solved, here).

## Data contract

```ts
type CountryCode = 'CO' | 'CL';
type Currency = 'COP' | 'CLP';

// --- Strapi `plan` content-type ---

interface PlanCoverage {
  name: string;
  description: string;
}

interface PlanBenefit {
  name: string;
  description: string;
}

interface StrapiPlanAttributes {
  name: string;
  shortDescription: string;
  /** Integer amount in the plan's currency, no decimals (e.g. 1250000 = COP 1,250,000). */
  basePrice: number;
  currency: Currency;
  coverages: PlanCoverage[];
  benefits: PlanBenefit[];
  order: number;
  recommended: boolean;
  active: boolean;
  country: CountryCode;
}

interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

interface StrapiCollectionResponse<T> {
  data: StrapiEntity<T>[];
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number };
  };
}

type PlanListResponse = StrapiCollectionResponse<StrapiPlanAttributes>;

// --- Front-end view model (post simulated pricing adjustment) ---

interface PlanViewModel {
  id: number;
  name: string;
  shortDescription: string;
  basePrice: number;
  adjustedPrice: number;
  currency: Currency;
  coverages: PlanCoverage[];
  benefits: PlanBenefit[];
  order: number;
  recommended: boolean;
  selected: boolean;
}

// --- Simulated pricing rule (see Open questions — formula is a proposed assumption) ---

/**
 * Provisional shape. Field names/types must be reconciled against US-01's approved data
 * contract for the step-1 form once that spec is final — see Open questions.
 */
interface Step1QuoteData {
  country: CountryCode;
  driverAge: number;
  vehicleYear: number;
  vehicleUsage: 'personal' | 'commercial';
}

interface PricingRuleInput {
  basePrice: number;
  step1: Step1QuoteData;
}

interface PricingRuleFactor {
  label: string;
  multiplier: number;
}

interface PricingRuleOutput {
  adjustedPrice: number;
  appliedFactors: PricingRuleFactor[];
}
```

## Definition of done

- [ ] The plans step requests plans through `CountryContentService` only, filtered by the
      current country and `active=true`, sorted by `order` ascending (tie-break: `id`
      ascending) — covers *Plans for the country*.
- [ ] Each plan renders name, short description, coverages, benefits, and the price in the
      country's currency and format, computed from `basePrice` adjusted by the documented
      simulated pricing rule — covers *Plans for the country*.
- [ ] A plan with `recommended: true` is visually distinguished (and the distinction is
      conveyed to assistive technology, not color/icon alone) — covers *Recommended plan*.
- [ ] Selecting a plan marks it as chosen (single-select) and enables navigation to the
      summary step; selecting a different plan replaces the previous selection — covers
      *Plan selection*.
- [ ] When the country has zero active+published plans, a CMS-sourced explanatory message
      is shown instead of an empty list, distinct from the technical-error state — covers
      *No plans available*.
- [ ] Loading and technical-error states are handled explicitly and are visually distinct
      from the "no plans available" content state.
- [ ] Returning to the plans step from the summary re-fetches plans and re-validates the
      prior selection, clearing it if the previously selected plan is no longer
      active/published.
- [ ] The whole plans step is operable by keyboard only, with visible focus and no keyboard
      traps.
- [ ] The plans step layout is responsive (single-column stacking on narrow viewports, no
      horizontal scroll).
- [ ] All Strapi-sourced data is typed against the interfaces in Data contract — no `any`.

## Open questions

- **Simulated pricing rule formula (needs approval).** The story requires the final price
  to be "adjusted by a simulated rule based on the step 1 data" and that "the rule is
  documented," but does not specify the formula. Proposed simulated rule
  (`SIMULATED-PRICING-RULE-v1`), to apply in order on top of `basePrice`:
  1. Driver age factor: `driverAge < 25` → ×1.15; `25 ≤ driverAge ≤ 60` → ×1.00;
     `driverAge > 60` → ×1.05.
  2. Vehicle age factor: `(current year − vehicleYear) > 10` → ×1.10; otherwise ×1.00.
  3. Usage factor: `vehicleUsage === 'commercial'` → ×1.20; `'personal'` → ×1.00.
  4. Round the result to the nearest whole currency unit (COP/CLP have no minor unit in
     common display).
  This is explicitly a **simulated, illustrative rule** (per `CLAUDE.md`: "price
  calculation may be simulated"), not an actuarial rating engine. It is flagged here as an
  assumption requiring human approval before implementation, not a silently-adopted
  default.
- **Where does the "no plans available" copy live in Strapi?** No existing content-type
  covers generic wizard/UI copy (the current catalogue is `form-field`, `plan`,
  `terms-and-condition`). Options: (a) add a field to the `plan` country scope itself is
  not applicable since there's no plan to attach it to when the list is empty; (b)
  introduce a new country-scoped singleton content-type for wizard copy (e.g.
  `wizard-copy`) following the same `country` field pattern as ADR-0001. Introducing a new
  content-type touches the content strategy, so this needs a decision from
  `strapi-architect` (and, per `CLAUDE.md`'s human-in-the-loop checkpoints, likely a short
  ADR amendment or at least explicit sign-off) before implementation.
- **Step-1 data contract dependency.** `Step1QuoteData` above is provisional. Its field
  names, types, and even which fields exist must be reconciled against US-01's approved
  spec and data contract once that spec is finalized, since US-02's pricing rule consumes
  that data directly.
- **Tie-break rule for equal `order` values.** This spec proposes falling back to ascending
  `id`. An alternative is to treat duplicate `order` values as invalid content and have the
  business team fix it in Strapi rather than defining front-end tie-break behavior at all.
  Needs confirmation.
- **Multiple plans marked `recommended`.** Confirm the proposed behavior (render the badge
  on all of them, no front-end dedup) is acceptable, or whether Strapi-side validation
  should constrain this to at most one plan per country.

## Resolutions (approved 2026-11-21)

- **Simulated pricing rule**: `SIMULATED-PRICING-RULE-v1` accepted as proposed, unchanged.
- **"No plans available" copy**: hardcoded, static English copy in Angular — not
  Strapi-configurable. Rationale: it's an edge-case message, not core business content;
  the test's configurability requirement targets form fields, plans and terms
  specifically. No new `wizard-copy` content-type is introduced, keeping the Strapi schema
  scoped to ADR-0001's three content-types.
- **Tie-break for duplicate `order`**: ascending `id`, consistent with US-01.
- **Multiple `recommended` plans**: render the badge on every flagged plan; no front-end
  dedup, no new Strapi-side uniqueness constraint.
- **`Step1QuoteData` reconciliation**: resolved via
  [ADR-0002](../docs/adr/0002-dynamic-form-rendering.md)'s reserved-key convention —
  `driverAge` is derived from the `dateOfBirth` reserved field, `vehicleYear` and
  `vehicleUsage` are read directly from their reserved keys in US-01's `Step1FormValue`.
