# Project State & Decision Log

> Live, append-only log of decisions and their approval status. Read this first in any
> new or resumed session, before re-deriving or re-discussing anything already settled
> here. Add new entries at the top of each table; never delete or rewrite a past entry —
> if a past decision turns out to be wrong, add a new entry that supersedes it and say so.

## Current phase

**Phase 8 — US-03 implementation (summary and payment)** (starting next)

## Decisions log

| Date | Decision | Status | Notes |
|---|---|---|---|
| 2026-11-21 | Phase 7 — US-02's real plan list implemented: `SIMULATED-PRICING-RULE-v1` as pure, independently-testable functions (`apps/web/src/app/core/pricing/simulated-pricing-rule.ts`), country-locale currency formatting, native-radio accessible selection, stale-selection re-validation on (re)entry | **Verified and approved** | Built by `angular-builder`; gave the most rigorous self-verification yet (hand-calculated pricing cross-checked against the rendered UI, a stale selection seeded directly into `sessionStorage` and confirmed cleared live, real keyboard arrow-key navigation, `es-CO` vs `es-CL` currency formatting visibly confirmed). Independently re-verified: code read (no `any`, correct `untracked`/`computed` usage, no repeat of the Phase 6 mutable-vs-signal bug), own `tsc`/`ng build` run clean, and a live spot-check in the browser (correct base prices, correct single `RECOMMENDED` badge, inactive plan excluded, selection + Continue enablement) | — US-01's real step-1 form implemented: dynamic typed `FormGroup` from live Strapi config, generic `Validators` mapping + custom `legalAgeValidator()` for `dateOfBirth`, misconfigured-`select` state, accessible labels/errors, `sessionStorage` rehydration | **Verified and approved** | Built by `angular-builder`; this agent gave an honest, itemized verification (including what it could *not* verify live, e.g. the misconfigured-select state has no real seed data to trigger it) and caught a real bug itself (`computed()` over `FormGroup.valid`, which mutates in place rather than emitting signal writes — fixed to a plain method). Independently re-verified in the browser myself: country switch renders the real 13-field CO form, legal-age validator fires with the exact configured error message, full valid fill enables Continue and navigates to `/quote/plans`, and browser back-navigation restores every value with no re-fetch |
| 2026-11-21 | Added `refetchFormFields()`/`refetchPlans()`/`refetchTerms()` to `CountryContentService`; changed the form page's "Retry" button from `window.location.reload()` to the real refetch | **Fixed and approved** | `angular-builder` had flagged the full-page-reload workaround itself (no clean refetch existed on the shared service, and extending it was out of that task's scope) rather than silently shipping it — fixed directly since it's a small, consistent addition to an already-approved service, not a new pattern |
| 2026-11-21 | Phase 5 — Angular `apps/web` scaffolded: standalone routing shell for the 3-step wizard, `CountryStore`/`WizardStore` (signals + `sessionStorage`), `CountryContentService` (country structurally cannot be omitted; explicit loading/error/data state) | **Verified and approved** | Built by `angular-builder`; this agent, unlike `strapi-architect`, actually ran `ng build`/`tsc --noEmit`/`ng serve` + curl and pasted real output — independently re-verified anyway (own `ng build` run clean, code read directly, zero `any` confirmed by grep) |
| 2026-11-21 | Corrected US-01/02/03 Data contracts: Strapi 5's REST API returns attributes flat on the entity (`{id, documentId, ...fields}`), not nested under a v4-style `attributes` key; `SelectedPlan.id` is `number`, not `string` | **Approved** | Discovered by `angular-builder` against the live, already-seeded Strapi API; independently confirmed against this session's own earlier `curl` output from Phase 4. `apps/web/src/app/core/models/*.ts` is the source of truth going forward |
| 2026-11-21 | `WizardStore` resets its whole state when `CountryStore`'s country changes after an initial selection | **Approved, kept in Phase 5** | Flagged by `angular-builder` as going slightly beyond "just the shape"; approved keeping it now since it's a direct, necessary consequence of ADR-0001 (country-scoped content) and US-03's already-approved "re-acceptance required on country change" resolution, not a new decision |
| 2026-11-21 | Phase 4 — Strapi `apps/cms` scaffolded: `form-field`/`plan`/`terms-and-condition` content-types, `shared.plan-detail-item` component, idempotent seed bootstrap, Public role limited to `find`/`findOne` on the three content-types | **Verified and approved** | Built by `strapi-architect` subagent; the agent stalled mid-task reporting vague "waiting on monitor" status twice without a final report, so verification was done directly against the running SQLite dev DB instead of trusting its self-report — confirmed 26/8/2 seeded entries (×2 for draft+published rows) and exactly 6 Public-role permissions (find/findOne only, no write), no secrets committed (`.env` correctly gitignored) |
| 2026-11-21 | Fixed a real bug found during re-verification: `apps/cms/src/seed/index.ts` failed to compile (`strapi develop` crashed on boot — "TypeScript compilation failed") because `seedIfEmpty<T extends Record<string, unknown>>` and the JSON-typed `validation`/`options` seed fields used named interfaces without index signatures, which don't structurally satisfy Strapi's generated `Data.Input`/`JSONValue` types | **Fixed and verified** | Replaced the one generic helper with three small per-content-type functions (`seedFormFieldsIfEmpty`/`seedPlansIfEmpty`/`seedTermsIfEmpty`) and changed `FormFieldValidation`/`FormFieldOption` from interfaces to `Record<string, ...>` types; re-verified end-to-end by actually booting `strapi develop` and `curl`-ing the live API: public `GET` returns the full seeded CO+CL data with HTTP 200, `POST`/`PUT` return HTTP 403 for the Public role |
| 2026-11-21 | ADR-0002 — reserved semantic `key` convention bridges US-01's dynamic form with US-02/US-03's semantic field needs | **Accepted** | `docs/adr/0002-dynamic-form-rendering.md`; surfaced during spec reconciliation, not anticipated at Phase 0 |
| 2026-11-21 | US-01, US-02, US-03 specs | **Approved** | `specs/US-01-*.md`, `specs/US-02-*.md`, `specs/US-03-*.md`; drafted in parallel by 3 `spec-writer` subagent runs, open questions resolved in a single human review round (see each spec's "Resolutions" section) |
| 2026-11-21 | US-03 simulated payment failure: deterministic test-level mock, no user-facing "simulate failure" UI control | Approved | Keeps the real flow free of dev-only UI; e2e reliability handled by `test-writer` stubbing the payment service |
| 2026-11-21 | US-02 simulated pricing rule `SIMULATED-PRICING-RULE-v1` accepted as proposed (driver-age / vehicle-age / usage multipliers) | Approved | See `specs/US-02-plan-list.md` Data contract + Resolutions |
| 2026-11-21 | "No plans available" copy is hardcoded English copy in Angular, not a new Strapi content-type | Approved | Scope guard: test's configurability requirement covers form fields/plans/terms, not every edge-case message |
| 2026-11-20 | ADR-0001 — explicit `country` field per content-type (not Strapi i18n, not per-country content-types) | **Accepted** | Approved by human reviewer; see `docs/adr/0001-multi-country-content-strategy.md` |
| 2026-11-20 | Remote: `https://github.com/Mateoguzmanz/Multi-Country-Auto-Insurance-Tests.git` | Approved | Added as `origin`; remote was empty at connection time |
| 2026-11-20 | Repository name: `car-insurance-multicountry` | Approved | No name required by the test; kebab-case, no spaces, avoids path issues with Docker/tooling |
| 2026-11-20 | Repo root is a dedicated subfolder, separate from the Spanish-language planning notes kept in the parent folder | Approved | Keeps the submitted repo English-only; planning notes (`PLAN-DE-ACCION.md`, translation) are local working aids, not deliverables |
| 2026-11-20 | Scaffolded `CLAUDE.md` + 7 subagents + 1 skill under `.claude/` | Approved | spec-writer, adr-writer, strapi-architect, angular-builder, test-writer, code-reviewer, flow-documenter; skill: project-conventions |
| 2026-11-20 | Human-in-the-loop model: gate on ADRs, security/permissions, each spec pre-implementation, and new architectural patterns; routine steps reviewed after the fact, not pre-approved | Approved | Avoids pausing on every micro-step while still gating the decisions that matter |

## Open questions / next decision needed

- Document-number masking (US-01's DoD line, US-03's own requirement) is still
  unimplemented anywhere — intentionally deferred to Phase 8 (US-03), since masking
  mainly matters once the number is displayed read-only in the summary. Tracked here so
  it isn't lost.
- "Two+ plans marked recommended" is untested against real data (current seed only has
  one per country); code renders the badge on every flagged plan unconditionally, which
  matches the spec's resolution, but flagging that this path is unverified live.
- Next: implement US-03's real summary & payment screen (Phase 8), including the
  deferred document-number masking.

## Phase tracker

| Phase | Status |
|---|---|
| 0 — Scaffolding | Done |
| 1 — Multi-country ADR | Accepted |
| 2 — Specs (US-01/02/03) | Approved |
| 3 — Additional technical ADRs | ADR-0002 Accepted |
| 4 — Strapi content-types & seed | Done, verified |
| 5 — Angular base scaffolding | Done, verified |
| 6 — US-01 implementation | Done, verified |
| 7 — US-02 implementation | Done, verified |
| 5 — Angular base scaffolding | Not started |
| 6 — US-01 implementation | Not started |
| 7 — US-02 implementation | Not started |
| 8 — US-03 implementation | Not started |
| 9 — Accessibility/responsive/security pass | Not started |
| 10 — Testing | Not started |
| 11 — Docker Compose & seed automation | Not started |
| 12 — Review consolidation & traceability | Not started |
| 13 — FLOW.md / README.md / logs | Not started |
| 14 — Final QA & delivery | Not started |
