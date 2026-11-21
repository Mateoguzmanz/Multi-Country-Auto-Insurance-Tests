# Project State & Decision Log

> Live, append-only log of decisions and their approval status. Read this first in any
> new or resumed session, before re-deriving or re-discussing anything already settled
> here. Add new entries at the top of each table; never delete or rewrite a past entry —
> if a past decision turns out to be wrong, add a new entry that supersedes it and say so.

## Current phase

**Phase 13 — FLOW.md / README.md / logs** (starting next)

## Decisions log

| Date | Decision | Status | Notes |
|---|---|---|---|
| 2026-11-21 | Phase 12 — consolidated per-story review files (`docs/reviews/US-01.md`, `US-02.md`, `US-03.md`, `infra-strapi-bootstrap.md`) and the full traceability table (`docs/traceability.md`) | **Done** | Written directly by the orchestrator, not a fresh `code-reviewer` run — the real review work already happened live throughout Phases 4-10 (every bug in this project was actually found and fixed during those phases, not invented now); Phase 12 is the formal write-up of that record, not a new review pass. US-01: 2 Important findings (Continue-button bug, UTC date-parsing bug), both fixed. US-02: 0 findings. US-03: 1 Important finding (sticky terms checkbox), fixed, plus 1 process gap (no live walkthrough) closed by Phase 10's e2e suite. Infra: 1 Important finding (Strapi seed bootstrap TS compile failure masked by a stalled agent's false self-report), fixed |
| 2026-11-21 | Phase 11 — `docker-compose.yml` + `apps/cms/Dockerfile` + `apps/web/Dockerfile`/`nginx.conf`: the whole project starts with `docker compose up` | **Verified and approved** | Built directly (no subagent — infra work spanning both apps plus root compose didn't fit any single defined subagent role cleanly). Docker Desktop wasn't running; started it and waited for the daemon. Actually ran `docker compose up --build`, not just wrote the files: confirmed Strapi seeds fresh on every `up` (no DB volume, by design — guarantees seed data is always present, never stale), confirmed exactly the same 26/8/2 form-field/plan/terms counts as the dev-server runs, confirmed write endpoints still return 403 inside the container, confirmed the Angular SPA (served via nginx) returns 200 on a deep-linked route (`/quote/form`) thanks to the `try_files` fallback, and re-ran a full `down` + `up` cycle to confirm the fresh-seed behavior holds. Containers stopped cleanly afterward (`docker compose down`) |
| 2026-11-21 | Phase 10 — 11 unit spec files (67 tests, Vitest+TestBed) + 3 Playwright e2e specs (happy-path CO, invalid-field, rejected-payment), all for real | **Verified and approved** | Built by `test-writer`. Independently re-ran both suites myself from a cold start (no servers running beforehand): `ng test` → 67/67 passed; `playwright test` → 3/3 passed, Strapi auto-started/torn down cleanly by `global-setup.ts`, confirmed no orphaned processes afterward. Read the e2e specs directly — they assert real things (raw document number never appears anywhere in the summary DOM, not just that the masked one does; post-approval back/forward navigation never resurrects a payable summary; rejected-payment preserves step-1 data checked by navigating back to it) |
| 2026-11-21 | Real bug found and fixed by `test-writer`: `new Date('YYYY-MM-DD')` parses as UTC midnight, which silently shifts the calendar date back one day when read with local getters in any timezone behind UTC — including Colombia and Chile, hitting both the legal-age validator (US-01) and the pricing rule's driver-age factor (US-02) | **Fixed and verified** | Added `core/formatting/parse-date-only.ts` (parses `YYYY-MM-DD` as local midnight instead), used at both call sites. Independently confirmed the fix is in place and the relevant tests pass |
| 2026-11-21 | Reversed the Phase 8 "no user-facing simulate-failure control" decision — added a second, clearly-labeled button ("Simulate a declined payment") next to Pay, and `SimulatedPaymentService.submitPayment` now takes an optional `simulateFailure` flag | **Approved by user** | User asked to make all 4 of US-03's Gherkin scenarios demonstrable by a human using the running app, not only provable via test code, given the whole payment step is already an explicitly simulated mock gateway (not a real one) per the test's own rules — see `specs/US-03-summary-payment.md`'s "Phase 10 correction" resolution. `test-phase10` (already running) was notified mid-flight to cover this scenario with a real Playwright e2e click-through instead of relying solely on a service mock |
| 2026-11-21 | Phase 9 — cross-cutting accessibility/responsive/security audit (`docs/reviews/non-functional-checklist.md`) | **Done, mostly code-verified** | Performed directly (no subagent) since it was a review pass over already-built code, not new feature work. Security: grep-audited for tokens (clean), re-confirmed Strapi Public permissions. Found and fixed 2 small polish gaps: empty global `styles.scss` (added box-sizing/body-margin baseline) and the leftover CLI default page title. Items depending on an actual click-through remain "pending live confirmation" due to the Chrome disconnect, same as Phase 8 |
| 2026-11-21 | Phase 8 — US-03's summary & payment screen implemented: document masking, `ReservedStep1Fields` projection, `SimulatedPaymentService` (mockable, always-approves), quote-number generator, post-approval lock, terms acceptance | **Code-verified and approved; live walkthrough still pending** | Built by `angular-builder`, who was explicit that no Chrome browser was connected in its environment and did not fabricate a live walkthrough — verified instead by running the actual shipped masking/quote-number/projection modules directly (`npx tsx`) and by code inspection of the rejected-payment path. I independently re-derived the masking algorithm by hand against all 4 of the spec's worked examples (`10••••••32`, `12.•••.•••-9`, both ≤4-char cases) and confirmed exact matches; `tsc`/`ng build` re-run clean. My own attempt at a live browser walkthrough also failed — the Chrome extension was disconnected in this session too (confirmed via repeated `list_connected_browsers` checks, even after the user restarted Chrome) — so the live click-through (checkbox toggle, pay-button disable timing, focus management on approve/reject, responsive layout) remains unverified by observation; it will be exercised by the Playwright e2e suite in Phase 10, which should be treated as closing this gap |
| 2026-11-21 | Fixed a real bug `angular-builder` flagged rather than hid: the terms checkbox could not be unchecked (`WizardStore` only had `acceptTerms`, no decline path) | **Fixed and approved** | Replaced `WizardStore.acceptTerms(version)` with `setTermsAccepted(accepted, version)` supporting both directions; sole call site (`quote-summary-page`) updated; `tsc`/`ng build` clean afterward |
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
- **US-03 live browser walkthrough is still outstanding** (Chrome extension
  disconnected for both the building agent and the orchestrator). Must be closed out
  either by a manual pass once Chrome reconnects, or treated as covered once Phase 10's
  e2e suite exercises the full payment flow — don't mark this story fully "done" for
  grading purposes until one of those happens.
- US-03's "pending live confirmation" items (Phase 8/9) are now considered **closed** —
  the Playwright e2e suite exercised the real pay flow, focus-dependent behavior aside
  (Playwright doesn't assert focus by default; if that specific detail ever needs
  confirming, it's the one remaining gap, otherwise consider it resolved by Phase 10).
- Next: Phase 13 — `FLOW.md` (the agentic flow table + diagram + 3 reflection
  questions) and `README.md` (run instructions, unmet requirements if any). Note for
  README: Docker Desktop must be running before `docker compose up` — call this out
  explicitly, since it's an easy thing for someone else to miss.

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
| 8 — US-03 implementation | Done, verified (e2e closed the live-walkthrough gap) |
| 9 — Accessibility/responsive/security pass | Done |
| 10 — Testing (unit + e2e) | Done, verified |
| 11 — Docker Compose & seed automation | Done, verified |
| 12 — Review consolidation & traceability | Done |
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
