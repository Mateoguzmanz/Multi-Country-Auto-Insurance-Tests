# 0002. Dynamic form rendering and reserved semantic field keys

Status: Accepted

## Context and problem statement

US-01's step-1 form is fully dynamic: fields, their order, validation and copy are
configured per country in Strapi (`form-field` content-type, ADR-0001). The resulting
form value is naturally a dynamic map keyed by each field's Strapi `key`
(`Step1FormValue`), not a fixed TypeScript shape — the business team can add, remove or
reorder fields without a code change.

Two downstream consumers, however, need specific semantic fields, not just "the form has
whatever the business configured":

- US-02's simulated pricing rule needs the driver's age, the vehicle's year, and whether
  usage is personal or commercial.
- US-03's summary screen needs to render policyholder name, (masked) document, contact
  info, and vehicle make/model/year/identifier in a predictable layout.
- US-01's own legal-age and vehicle-year validators need to know *which* configured field
  is "date of birth" or "vehicle year," since those rules aren't plain min/max checks.

We need a way to bridge a fully dynamic, business-configured form with code that needs
specific semantic fields, without hardcoding field presence/order (which would break the
core "business team adds/removes/reorders fields without a code change" requirement) and
without the business team being able to silently break pricing/summary/validation by
renaming a field's key.

## Decision drivers

- Must not reintroduce a fixed/hardcoded form shape.
- Must give the legal-age/vehicle-year validators (US-01), the pricing rule (US-02), and
  the summary screen (US-03) a reliable way to find "the date of birth field" etc. among
  dynamically configured fields.
- Must stay simple enough for the business team (editing Strapi) to follow without
  training.
- Avoid adding new Strapi schema if a naming convention achieves the same result.

## Considered options

1. **Reserved semantic `key` convention.** A fixed, documented set of `key` values (e.g.
   `fullName`, `documentNumber`, `dateOfBirth`, `vehicleYear`, `vehicleUsage`, …) that,
   when used as a `form-field.key` in Strapi, are understood by the front end to carry
   that specific meaning. The business team can still add *extra* fields with any other
   key; only the fields the app depends on for validation/pricing/summary must use these
   exact keys.
2. **Dedicated `semanticRole` field on `form-field`.** Add an explicit enum field in
   Strapi (`semanticRole: 'dateOfBirth' | 'vehicleYear' | 'vehicleUsage' | 'none'`) so the
   mapping is data, not a naming convention.
3. **No semantic bridge.** US-02/US-03 each read the raw dynamic map directly, assuming
   keys independently at each call site.

### Option 1 — reserved key convention

- Good: zero new Strapi schema; reuses the `key` field that already has to be unique and
  stable per field.
- Good: simple to document (one table in this ADR) and simple for the business team to
  follow — "use this exact key for this field."
- Bad: nothing in Strapi structurally enforces it; a business user could create a
  date-of-birth-equivalent field under a different key, silently breaking legal-age
  validation. Mitigated by seed data always including the reserved keys and a loud,
  explicit error if one is missing for the active country (see Consequences).

### Option 2 — dedicated `semanticRole` field

- Good: explicit and structurally enforced.
- Bad: adds schema complexity for a problem a naming convention already solves at this
  project's scale; every new semantic need would require a Strapi migration to extend the
  enum, cutting against "business team changes things without a deployment" for anything
  beyond the roles anticipated today.

### Option 3 — no bridge, ad hoc per consumer

- Bad: no single source of truth for which keys matter; US-02 and US-03 could each assume
  different key names for the same concept — exactly the inconsistency this ADR exists to
  prevent. Not pursued further.

## Decision outcome

Chosen option: **Option 1 — reserved semantic key convention**, because it solves the
problem with zero added Strapi schema, and its failure mode (a business user picking the
wrong key) is cheaply mitigated at the application boundary.

**Reserved keys** (used as `form-field.key` wherever a country's form includes that
semantic field):

| Reserved key | Type | Meaning | Consumed by |
|---|---|---|---|
| `fullName` | text | Policyholder full name | US-03 summary |
| `documentType` | select | e.g. `CC`/`CE` (CO), `RUT` (CL) | US-03 summary |
| `documentNumber` | text | Identity document number (masked at render time) | US-01 masking, US-03 summary |
| `dateOfBirth` | date | Triggers the legal-age (≥ 18) validator | US-01 validation |
| `email` | text | Contact email | US-03 summary |
| `phone` | text | Contact phone | US-03 summary |
| `vehicleMake` | select | Vehicle make | US-03 summary |
| `vehicleModel` | text | Vehicle model | US-03 summary |
| `vehicleYear` | number | Triggers the vehicle-year range validator | US-01 validation, US-02 pricing |
| `vehicleIdentifier` | text | Placa (CO) / patente (CL) | US-03 summary |
| `vehicleUsage` | select (`personal`\|`commercial`) | Feeds the simulated pricing rule | US-02 pricing |

Each country's `form-field` seed data must include all of these keys (with per-country
labels/copy/validation), plus any extra country-specific fields under any other key.

### Consequences

- Good: `Step1FormValue` stays a dynamic map (`{[key]: value}`), while a typed
  `ReservedStep1Fields` projection (reading exactly these keys) is what US-02 and US-03
  actually consume — this reconciles all three specs' data contracts without hardcoding
  the whole form shape.
- Good: a country-specific extra field never breaks pricing/summary/validation, since
  those only ever read the reserved keys.
- Good: extending to a new semantic need later is a documentation change (add a row here)
  plus front-end code, not a Strapi migration.
- Bad: if seed data for a country omits a reserved key, or a business user later
  deletes/renames that field, the dependent feature breaks. Mitigated by: seed data for
  both countries always including every reserved key, and the front end surfacing a loud,
  explicit "missing required field: dateOfBirth" error during development/content review
  (not a silent fallback) when a reserved key is absent for the active country — this is a
  content-configuration error to fix in Strapi, not a case to design around in Angular.
- Bad: relies on documentation discipline rather than a compiler/schema guarantee;
  acceptable at this project's scale — revisit Option 2 if the number of reserved keys
  grows significantly.
