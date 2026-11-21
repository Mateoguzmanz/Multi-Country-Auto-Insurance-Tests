# Project State & Decision Log

> Live, append-only log of decisions and their approval status. Read this first in any
> new or resumed session, before re-deriving or re-discussing anything already settled
> here. Add new entries at the top of each table; never delete or rewrite a past entry —
> if a past decision turns out to be wrong, add a new entry that supersedes it and say so.

## Current phase

**Phase 6 — US-01 implementation (real step-1 form)** (starting next)

## Decisions log

| Date | Decision | Status | Notes |
|---|---|---|---|
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

- None blocking. Next: implement US-01's real step-1 form (Phase 6) — dynamic
  `FormGroup` built from `CountryContentService.getFormFields()`, validators mapped per
  field, accessible labels/errors, against the now-corrected flat data contract.

## Phase tracker

| Phase | Status |
|---|---|
| 0 — Scaffolding | Done |
| 1 — Multi-country ADR | Accepted |
| 2 — Specs (US-01/02/03) | Approved |
| 3 — Additional technical ADRs | ADR-0002 Accepted |
| 4 — Strapi content-types & seed | Done, verified |
| 5 — Angular base scaffolding | Done, verified |
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
