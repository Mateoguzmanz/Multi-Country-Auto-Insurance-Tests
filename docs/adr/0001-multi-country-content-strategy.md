# 0001. Multi-country content differentiation strategy

Status: Accepted

## Context and problem statement

The same Angular build must sell car insurance in Colombia and Chile. Form fields, their
validations and copy, the available plans, and the terms & conditions text all differ by
country, and the non-technical business team must be able to change all of that from
Strapi without requesting a deployment. We need a content-modeling strategy in Strapi —
and a corresponding consumption pattern in Angular — that differentiates content by
country without duplicating the application or the Strapi schema per country.

## Decision drivers

- Single app, single build, single Strapi schema serving both countries (explicit scope
  rule in the test).
- Non-technical business team edits fields/plans/terms per country with no code change.
- Colombia and Chile share the same language (Spanish) but differ in regulation, identity
  document, vehicle identifier, currency and copy — the variation is **business/regulatory**,
  not linguistic.
- Must stay easy to extend to a third country later without a schema migration.
- No write-enabled token may reach the browser; the front end only ever reads.

## Considered options

1. **Explicit `country` field on each content-type**, consumed by Angular via a REST
   filter (`filters[country][$eq]=CO`). One schema for `form-field`, `plan`,
   `terms-and-condition`, each entry tagged with its country.
2. **Strapi i18n plugin, using locale as a proxy for country** (e.g. `es-CO`, `es-CL`),
   relying on Strapi's built-in locale negotiation and localized entries.
3. **Separate content-types per country** (e.g. `form-field-co`, `form-field-cl`), or
   separate Strapi projects per country.

### Option 1 — explicit `country` field

- Good: country is a first-class, explicit business concept, not overloaded onto a
  mechanism meant for language. Adding a third country is just new entries with a new
  country value — no schema change, no new content-type.
- Good: a single `CountryContentService` in Angular can enforce the country filter on
  every request in one place, keeping the "same app, same build" rule trivially true.
- Good: keeps Strapi's i18n plugin free for its actual purpose (translating copy into
  another *language*, e.g. English) if that's ever needed later, without conflict.
- Bad: the front end is responsible for always passing the country filter; forgetting it
  on one query could leak cross-country content. Mitigated by routing every content read
  through one shared service (see "Consequences" below).
- Bad: no automatic locale negotiation from the browser/CDN "for free" the way i18n gives
  you — country selection has to be resolved explicitly (see Consequences).

### Option 2 — i18n plugin as country proxy

- Good: built-in Strapi feature; the admin UI already has a locale switcher and
  per-locale publish state.
- Bad: conflates two independent axes (*language* and *country/regulatory content*).
  Colombia and Chile both use Spanish, so there is no language difference to encode here —
  using locale for country is a semantic misuse that will confuse the content team (the
  locale switcher reads as "translate this," not "this is a different country's rules").
  If the business later wants an actual English version for either country, it immediately
  collides with this scheme.
- Bad: i18n relationships in Strapi are heavier to manage for content types that also need
  country-specific *structural* differences (e.g., a field that only exists in Chile),
  since i18n assumes the same shape translated, not a different shape per locale.

### Option 3 — separate content-types or separate Strapi projects per country

- Bad: directly violates the "single app/single schema" driver — adding a country means
  duplicating content-types (or whole projects), and Angular would need per-country code
  paths to know which content-type to call, undermining "the same build serves both
  countries."
- Bad: doubles the maintenance and review surface for every future change.
- Not pursued further; included only to document why it was rejected.

## Decision outcome

Chosen option: **Option 1 — explicit `country` field on each content-type**, because it
models country as what it actually is (a business/regulatory dimension), keeps a single
schema and a single build, and scales to a third country with zero schema changes.

Implementation consequences for Strapi and Angular:

- Content-types `form-field`, `plan`, `terms-and-condition` (and any future
  country-varying content-type) each carry a `country` enumeration field (`CO` | `CL`,
  extensible).
- Strapi Public role permissions remain `find` / `findOne` only; country filtering happens
  via query parameters on those same endpoints — no extra permission surface.
- Angular reads country-scoped content exclusively through one `CountryContentService`
  (built in Phase 5) that always applies the `country` filter, so no call site can
  accidentally omit it.
- For this test, the current country is resolved by an explicit, user-visible country
  selector persisted in the wizard's signal-based state (not geo-IP or subdomain
  routing) — documented as an intentional simplification in `README.md`, since automatic
  country resolution is out of scope for the functional requirements given.

### Consequences

- Good: adding Argentina or Mexico later is pure content work in Strapi, no code or
  schema change.
- Good: business team edits per-country content directly, no deployment, matching the
  core requirement.
- Good: keeps the door open for genuine i18n (translation) later without redesigning this.
- Bad: correctness now depends on every content read going through the shared
  `CountryContentService` — enforced by code review (`code-reviewer` agent + human) rather
  than by the framework itself.
- Bad: country selection in this test is manual (a selector), not automatic; acceptable
  for the stated scope but would need a real resolution strategy (domain, session,
  geolocation) before production use.
