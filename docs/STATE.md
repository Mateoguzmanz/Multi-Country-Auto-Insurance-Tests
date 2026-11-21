# Project State & Decision Log

> Live, append-only log of decisions and their approval status. Read this first in any
> new or resumed session, before re-deriving or re-discussing anything already settled
> here. Add new entries at the top of each table; never delete or rewrite a past entry —
> if a past decision turns out to be wrong, add a new entry that supersedes it and say so.

## Current phase

**Phase 2 — Specs (US-01/02/03)** (starting next)

## Decisions log

| Date | Decision | Status | Notes |
|---|---|---|---|
| 2026-11-20 | ADR-0001 — explicit `country` field per content-type (not Strapi i18n, not per-country content-types) | **Accepted** | Approved by human reviewer; see `docs/adr/0001-multi-country-content-strategy.md` |
| 2026-11-20 | Remote: `https://github.com/Mateoguzmanz/Multi-Country-Auto-Insurance-Tests.git` | Approved | Added as `origin`; remote was empty at connection time |
| 2026-11-20 | Repository name: `car-insurance-multicountry` | Approved | No name required by the test; kebab-case, no spaces, avoids path issues with Docker/tooling |
| 2026-11-20 | Repo root is a dedicated subfolder, separate from the Spanish-language planning notes kept in the parent folder | Approved | Keeps the submitted repo English-only; planning notes (`PLAN-DE-ACCION.md`, translation) are local working aids, not deliverables |
| 2026-11-20 | Scaffolded `CLAUDE.md` + 7 subagents + 1 skill under `.claude/` | Pending human review | spec-writer, adr-writer, strapi-architect, angular-builder, test-writer, code-reviewer, flow-documenter; skill: project-conventions |
| 2026-11-20 | Human-in-the-loop model: gate on ADRs, security/permissions, each spec pre-implementation, and new architectural patterns; routine steps reviewed after the fact, not pre-approved | Approved | Avoids pausing on every micro-step while still gating the decisions that matter |

## Open questions / next decision needed

- None blocking. Next: draft specs for US-01, US-02, US-03 (Phase 2).

## Phase tracker

| Phase | Status |
|---|---|
| 0 — Scaffolding | Done |
| 1 — Multi-country ADR | Accepted |
| 2 — Specs (US-01/02/03) | Not started |
| 3 — Technical ADRs | Not started |
| 4 — Strapi content-types & seed | Not started |
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
