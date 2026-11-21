# US-01 — Policyholder and vehicle data form

Status: Approved

## Story

As a person interested in insuring my car, I want to enter my data and my vehicle's data
in a simple form, so that I receive insurance options suited to my country and my
vehicle.

## Business rules

- Each field is configured in Strapi with: label, type (text, number, select, date,
  checkbox), required flag, validations, help text, error message, order and country.
- Select fields (for example, make or city) get their options from Strapi.
- The vehicle year cannot be later than next year or more than 20 years old.
- The policyholder must be of legal age.

## Acceptance criteria

```gherkin
Scenario: Form configured by country
  Given fields are configured in Strapi for Colombia and for Chile
  When I open the application in the context of a country
  Then I see only the fields configured for that country, in the defined order

Scenario: Field validation
  Given I am filling out the form
  When a field does not meet its configured validation
  Then I see the configured error message next to the field
  And I cannot move to the next step

Scenario: Configuration change without deployment
  Given the business team adds a new published field in Strapi
  When I reload the application
  Then the new field appears without code changes

Scenario: Keep data when going back
  Given I moved on to step 2
  When I go back to step 1
  Then my data is still filled in
```

## Gaps and edge cases

- **Country resolution**: per ADR-0001, the current country is read from the explicit
  user-visible country selector in wizard state, not geo-IP/subdomain. This spec assumes
  that selector already set a `country` value (`CO` | `CL`) before step 1 renders; the
  selector itself is out of scope for this story.
- **Loading state**: while `form-field` entries are being fetched from Strapi for the
  active country, the form area must show a loading indicator and not render a partial or
  empty form.
- **Error state**: if the Strapi request fails (network error, 5xx) or returns zero fields
  for the selected country, the form must show an explicit error state with a retry
  affordance — not a silently empty form, and not a crash.
- **Empty state**: zero configured fields for a country is a valid (if degenerate) Strapi
  state; it must be distinguished from a fetch error (see above) — e.g. "no fields
  configured for this country yet" vs. "couldn't load the form."
- **Unpublished fields**: Strapi's draft/publish workflow means a `form-field` entry can
  exist but be unpublished. The front end only ever reads published entries (consistent
  with Public role `find`/`findOne` access per CLAUDE.md) — an added-but-unpublished field
  must not appear until published, which is what AC "Configuration change without
  deployment" exercises.
- **Duplicate `order` values**: if two fields share the same `order` for a country, the
  tie-break is undefined by the story. Flagged as an open question below rather than
  inventing a silent tie-break rule.
- **`select` field with no options configured**: a `select` field whose options array is
  empty must not render as a broken/empty dropdown blocking the user; treated as a
  misconfiguration to surface, not silently skip (see Open questions — exact UX for this
  isn't specified).
- **Field types and native validation mapping**: `date` fields need a concrete min/max
  policy for the vehicle-year rule (see Data contract) — modeled as a `number` field
  semantically representing a year, not a native `<input type="date">`, since "vehicle
  year" is a year, not a calendar date. This is called out explicitly because the story's
  field type enum includes `date` generically but the one business rule mentioning a year
  needs a numeric range check, not a date picker.
- **Legal-age validation**: requires a `date` field for date of birth and a computed
  check (today − dob ≥ 18 years) that is *not* a simple Strapi-configured min/max, since
  "legal age" is a moving target relative to today's date, not a fixed bound. This is a
  built-in validator in the Angular form, applied whenever a field is semantically a
  date-of-birth field (see Open questions — how the field's semantic role, e.g. "this is
  the DOB field," is identified from Strapi config).
- **Masking sensitive identifiers**: per the project's accessibility & security
  checklist, the identity-document field's value must be masked in the UI (e.g. after
  entry/on blur), consistent with "sensitive identifiers (document numbers) are masked."
- **Back-navigation persistence**: "keep data when going back" implies step-1 form state
  must survive navigating to step 2 and back without a round-trip to Strapi or the
  backend — i.e., it is held in wizard-level state (signals), not re-fetched or reset on
  re-entering step 1. Re-entering step 1 must also not re-trigger the loading state for
  the field configuration (already-fetched config is reused, not re-requested with a
  visible spinner each time).
- **Validation re-check on re-entry**: if a field's value was left invalid and the user
  navigated away via browser back/forward (not only the wizard's own "back"), the
  invalid state and its error message must still be shown when step 1 is shown again.
- **Field reordering mid-session**: if `order` changes in Strapi between the initial load
  and a reload, the story only promises the *new* order "without code changes" after a
  reload — it does not promise live reordering without reload. No action needed beyond
  what AC 3 already covers.
- **Dynamic, typed validation**: since fields and their validators come from configuration
  rather than compile-time code, the step-1 form must build Angular reactive-form
  validators at runtime from the Strapi config while keeping the resulting form value
  typed (see Data contract) — no `any` in the resulting form model, per CLAUDE.md.
- **Keyboard and labels**: every dynamically-generated field must still get a
  programmatically associated `<label>`/`aria-describedby` pair and be reachable in
  logical tab order, including `select` and `checkbox` types, since the field set itself
  is only known at runtime.
- **Responsive layout**: the dynamically-generated field list must reflow correctly at
  mobile widths regardless of how many fields a given country has configured (field count
  is data-driven, not fixed at design time).

## Data contract

```ts
type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

type CountryCode = 'CO' | 'CL';

interface FormFieldOption {
  label: string;
  value: string;
}

interface FormFieldValidation {
  // Exact validation rule shapes (regex source, min/max, min/max length) are an
  // open question — see "Open questions". This interface models the superset of
  // constraints implied by the story's business rules (vehicle year range, required).
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Strapi content-type: `form-field`
interface FormFieldAttributes {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  validation?: FormFieldValidation;
  helpText?: string;
  errorMessage: string;
  order: number;
  country: CountryCode;
  options?: FormFieldOption[]; // present only when type === 'select'
}

interface FormFieldEntry {
  id: number;
  attributes: FormFieldAttributes;
}

// Front-end wizard state for step 1 (policyholder + vehicle data).
// Keyed by each field's Strapi `key`; values are typed per FieldType at the
// reactive-form-control level, not as a single flat `any` record.
type FormFieldValue = string | number | boolean | null;

interface Step1FormValue {
  [fieldKey: string]: FormFieldValue;
}

interface Step1State {
  country: CountryCode;
  fields: FormFieldEntry[]; // as loaded from Strapi for `country`, pre-sorted by order
  value: Step1FormValue;
  status: 'loading' | 'error' | 'empty' | 'ready';
}
```

## Definition of done

- [ ] Step 1 renders only the published `form-field` entries whose `country` matches the
      active country, sorted by `order` — nothing from the other country is visible or
      fetched. *(AC: Form configured by country)*
- [ ] Each field's configured validation runs on submit/step-advance; a failing field
      shows its configured `errorMessage` next to the field via `aria-describedby`, and
      the wizard does not advance to step 2 while any required/invalid field remains.
      *(AC: Field validation)*
- [ ] A new published field added in Strapi for the active country appears after an
      application reload, with no front-end code change, respecting its configured
      `order`. *(AC: Configuration change without deployment)*
- [ ] Navigating from step 1 to step 2 and back preserves every previously entered
      step-1 value exactly as the user left it, without a re-fetch of field
      configuration and without resetting validation state. *(AC: Keep data when going
      back)*
- [ ] Vehicle year field rejects a value later than next year or more than 20 years old,
      surfacing the configured error message.
- [ ] Policyholder date-of-birth field rejects an age under 18, surfacing an error
      message.
- [ ] `select` fields render their options exclusively from the Strapi-configured
      `options` list.
- [ ] The identity-document field's value is masked in the UI per the project's
      accessibility & security checklist.
- [ ] The full step-1 form (including dynamically generated fields) is completable with
      keyboard only, with every field programmatically labeled.
- [ ] Step 1 renders correctly at mobile and desktop widths.
- [ ] Loading, error, and empty states for the Strapi field fetch are each handled
      explicitly and distinguishably.
- [ ] No `any` appears in the step-1 form value or field-configuration types.

## Open questions

- Exact validation pattern/regex for Colombian identity documents (cédula de ciudadanía /
  cédula de extranjería), Colombian license plate (placa), Chilean RUT, and Chilean
  license plate (patente) are not specified in the source material. Rather than inventing
  precise regexes, this spec leaves `FormFieldValidation.pattern` as a free-form string
  sourced from Strapi config — the actual regex values are a Strapi *content* decision
  for whoever configures the fields, not a front-end hardcoded rule. Needs confirmation
  from the business/test owner on whether these patterns should ship as seed data (and if
  so, what the exact patterns are) or remain fully business-team-authored.
- How is a field's *semantic role* (e.g. "this field is the policyholder's date of
  birth," "this field is the vehicle year") identified from Strapi config for rules that
  aren't plain min/max (legal age relative to today, vehicle-year window relative to the
  current year)? Options include a reserved `key` naming convention (e.g. `key ===
  'dateOfBirth'`) or a dedicated semantic-role field in the content-type. Needs a decision
  before the Strapi `form-field` schema is finalized (likely as a follow-up ADR or a
  decision captured directly in the `strapi-architect` agent's schema work).
- Tie-break behavior when two fields for the same country share the same `order` value is
  unspecified — stable-by-insertion-order, by `id`, or treated as a content error to
  surface to the business team? Needs a decision before implementation.
- UX for a misconfigured `select` field (type `select` with an empty `options` array):
  render nothing, render disabled, or surface a visible configuration-error state? Not
  specified by the story.
- Is the identity-document masking format (which characters are shown vs. masked, and
  when unmasking is allowed, e.g. on focus) specified anywhere, or is any reasonable
  masking acceptable for this story?

## Resolutions (approved 2026-11-21)

- **Validation patterns**: remain free-form `pattern` strings authored as Strapi content
  (not hardcoded in Angular). `strapi-architect` provides reasonable example seed
  patterns for CO (cédula, placa) and CL (RUT, patente) as a starting point for the
  business team.
- **Semantic role identification**: resolved via a reserved `key` naming convention — see
  [ADR-0002](../docs/adr/0002-dynamic-form-rendering.md). `dateOfBirth` and `vehicleYear`
  are the reserved keys the legal-age and vehicle-year validators look for.
- **Duplicate `order` tie-break**: ascending `id`, applied consistently with US-02.
- **Empty `select` UX**: render a visible configuration-error state for that field (e.g.
  "this field is misconfigured — contact the business team"), never a silently
  broken/empty dropdown.
- **Document masking format**: first 2 and last 2 characters visible, the rest replaced
  with `•`, country formatting reapplied around the mask — same algorithm as US-03's,
  applied here wherever the document number is shown outside the active edit field.
