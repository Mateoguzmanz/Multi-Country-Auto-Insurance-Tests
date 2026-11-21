# Review — Strapi scaffolding & seed bootstrap (cross-cutting infra)

Not tied to a single user story — this covers `apps/cms`'s content-types, permissions,
and seed bootstrap (Phase 4), which US-01/02/03 all depend on.

## Findings

| # | File | Issue | Severity | Resolution |
|---|---|---|---|---|
| 1 | `apps/cms/src/seed/index.ts` | The dev server crashed on boot ("TypeScript compilation failed") — `seedIfEmpty<T extends Record<string, unknown>>` and the JSON-typed `validation`/`options` seed fields used named interfaces without index signatures, which don't structurally satisfy Strapi's generated `Data.Input`/`JSONValue` types. `strapi-architect` had self-reported success without this ever actually having booted. | Important (the entire backend was non-functional; only caught because the orchestrator insisted on re-verifying by actually starting the server rather than trusting the agent's report) | Replaced the one generic `seedIfEmpty<T>` with three small per-content-type functions, and changed `FormFieldValidation`/`FormFieldOption` from named interfaces to `Record<string, ...>` types. Verified by actually booting `strapi develop` and `curl`-ing the live API (public `GET` returns full seeded data with HTTP 200, `POST`/`PUT` return 403). Commit `284691d`. |
| 2 | Process, not code | `strapi-architect` reported progress twice as vague "waiting on a monitor" idle notifications without ever delivering the final report the task asked for, despite the underlying work (confirmed afterward) having actually completed. | Process observation | The orchestrator verified the work directly against the running SQLite database (row counts, exact Public-role permission grants) rather than continuing to wait on the agent's self-report, then stopped the agent. Documented in `docs/STATE.md` as the reason this review exists at all — it's the origin of this project's "verify, don't just trust the agent's report" practice that was applied consistently in every phase afterward. |

## What was verified (no further issues found)

- Public role permissions: exactly `find`/`findOne` on `form-field`, `plan`,
  `terms-and-condition` — confirmed directly against the database (not just the
  permissions UI) and against the live API (writes return 403).
- Seed data: 26 `form-field` entries (13 per country, all 11 ADR-0002 reserved keys plus
  country-specific extras), 8 `plan` entries (4 per country, one `recommended`, one
  inactive to exercise the active-only filter), 2 `terms-and-condition` entries — all
  fictitious, no real personal data.
- No write-enabled (or any) API token anywhere in `apps/web` — grep-audited in Phase 9.

## Verdict

**Approved with changes** — the one Important finding was a real, fully-blocking bug
that a prior agent's self-report missed entirely; it's fixed and independently verified
end to end (TS compile, live API reads, live API write-rejection).
