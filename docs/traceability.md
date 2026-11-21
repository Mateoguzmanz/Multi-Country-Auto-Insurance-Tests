# Traceability — user story → spec → ADR → code → tests → review

This is the thread the test document asks for: for each user story, every artifact that
exists because of it, and the commit(s) where it landed. Commit hashes refer to this
repository's `master` branch.

## US-01 — Policyholder and vehicle data form

| Stage | Artifact |
|---|---|
| Spec | [`specs/US-01-policyholder-vehicle-form.md`](../specs/US-01-policyholder-vehicle-form.md) |
| ADRs | [ADR-0001](adr/0001-multi-country-content-strategy.md) (country filtering), [ADR-0002](adr/0002-dynamic-form-rendering.md) (reserved semantic keys — `dateOfBirth`, `vehicleYear`, etc.) |
| Code | `apps/web/src/app/features/quote/quote-form-page/*`, `apps/web/src/app/core/formatting/parse-date-only.ts` — commits `f92935a` (base scaffolding), `2231c2f` (implementation), `8aa4e2e` (date-parsing bug fix) |
| Tests | `quote-form-page.component.spec.ts`, `parse-date-only.spec.ts` (unit) · `e2e/tests/invalid-field.spec.ts`, `e2e/tests/happy-path-co.spec.ts` (step-1 portion) (e2e) — commit `8aa4e2e` |
| Review | [`docs/reviews/US-01.md`](reviews/US-01.md) — 2 Important findings, both fixed and verified |

## US-02 — Plan list

| Stage | Artifact |
|---|---|
| Spec | [`specs/US-02-plan-list.md`](../specs/US-02-plan-list.md) |
| ADRs | [ADR-0001](adr/0001-multi-country-content-strategy.md), [ADR-0002](adr/0002-dynamic-form-rendering.md) (pricing rule reads the reserved keys) |
| Code | `apps/web/src/app/features/quote/quote-plans-page/*`, `apps/web/src/app/core/pricing/simulated-pricing-rule.ts` — commit `8ffe311` |
| Tests | `simulated-pricing-rule.spec.ts` (unit) · `e2e/tests/happy-path-co.spec.ts` (step-2 portion) (e2e) — commit `8aa4e2e` |
| Review | [`docs/reviews/US-02.md`](reviews/US-02.md) — no findings |

## US-03 — Summary and payment

| Stage | Artifact |
|---|---|
| Spec | [`specs/US-03-summary-payment.md`](../specs/US-03-summary-payment.md) |
| ADRs | [ADR-0001](adr/0001-multi-country-content-strategy.md), [ADR-0002](adr/0002-dynamic-form-rendering.md) |
| Code | `apps/web/src/app/features/quote/quote-summary-page/*`, `core/formatting/mask-document-number.ts`, `core/forms/project-reserved-step1-fields.ts`, `core/payment/generate-quote-number.ts`, `core/services/simulated-payment.service.ts` — commits `cbdc517` (implementation), `64845d3` (visible payment-decline control, superseding an earlier resolution) |
| Tests | `mask-document-number.spec.ts`, `project-reserved-step1-fields.spec.ts`, `generate-quote-number.spec.ts`, `simulated-payment.service.spec.ts`, `quote-summary-page.component.spec.ts` (unit) · `e2e/tests/happy-path-co.spec.ts` (step-3 + payment), `e2e/tests/rejected-payment.spec.ts` (e2e) — commit `8aa4e2e` |
| Review | [`docs/reviews/US-03.md`](reviews/US-03.md) — 1 Important finding, fixed and verified; 1 process gap, closed by the e2e suite |

## Cross-cutting infrastructure (not tied to one story)

| Stage | Artifact |
|---|---|
| ADR | [ADR-0001](adr/0001-multi-country-content-strategy.md) — the multi-country strategy every story's content depends on |
| Code | `apps/cms/**` (content-types, Public-role permissions, seed bootstrap) — commits `8f43be3` (scaffold), `284691d` (bug fix) · `apps/web/src/app/core/services/country-content.service.ts`, `core/state/{country,wizard}.store.ts` — commit `f92935a` · `docker-compose.yml`, `apps/*/Dockerfile` — commit `7b47a20` |
| Review | [`docs/reviews/infra-strapi-bootstrap.md`](reviews/infra-strapi-bootstrap.md) — 1 Important finding, fixed and verified |
| Non-functional | [`docs/reviews/non-functional-checklist.md`](reviews/non-functional-checklist.md) — accessibility, responsive, security audit (Phase 9) |

## Decision log

Every architectural and scope decision referenced above — including the two that were
reconsidered and reversed mid-project (US-03's payment-rejection mechanism; see its
"Phase 10 correction" resolution) — is recorded with its rationale in
[`docs/STATE.md`](STATE.md), which is the append-only source of truth for *why*, not
just *what*.
