---
name: verification-first
description: Checklist and concrete techniques for independently verifying a subagent's (or your own) "it's done" claim before marking a phase complete or reporting status to the human — never trust a self-report alone. Use before closing out any implementation task, especially right after a subagent reports completion, and whenever a status update sounds vague ("waiting", "should be fine", "idle") rather than citing a specific command and its output.
---

# Verification-first

This project's single most consequential process adjustment: `strapi-architect` twice
reported a vague "idle, waiting on a monitor" status without ever delivering its final
report, while the underlying work had, in fact, already finished successfully. From that
point on, nothing was marked done on a subagent's word alone — every phase was
independently re-verified against a primary source. Use this checklist the same way.

## Red flags in a status report

- Vague progress language ("working on it", "should be ready soon", "waiting") with no
  concrete artifact, command, or output cited.
- A claim of success with no corresponding command output, file diff, or observable
  state change you can check yourself.
- "It compiles" / "it works" with no actual build or run log attached.

Any of these: stop, don't propagate the claim, go verify directly instead.

## Concrete verification by area

**Strapi / CMS content and permissions**
- Don't trust "seeded" — query the live database or hit the live REST API with `curl`
  and count the actual records.
- Don't trust "Public role is read-only" — check the live Users & Permissions config
  (or the DB rows behind it) and confirm `POST`/`PUT` against the API actually return
  403, not just that the admin UI shows the expected checkboxes.
- Don't trust "it compiles" — actually boot the dev server from a cold start and watch
  it reach "started successfully", not just read the source.

**Angular / front end**
- Run `tsc`/`ng build` yourself; a subagent's own build log is not a substitute for
  your own clean run.
- Run the unit and e2e suites yourself, from a cold start, and read the actual pass/fail
  counts — don't accept a summary of them.
- For anything a human would see, actually load it in a browser (or drive one via
  automation) and look — don't infer the UI from the component code alone.

**Business logic / calculations (pricing, masking, date math, etc.)**
- Hand-derive the expected output for at least one worked example and compare it to
  what the code actually produces — don't just confirm a test passes; confirm the test
  itself asserts the *correct* value.

**Git / remote state**
- After any push, `git fetch` and diff against the remote — don't assume a push
  succeeded or landed cleanly just because the command returned without an error.

**When a fix supersedes an earlier decision**
- If re-verification surfaces that an earlier "approved" decision was actually wrong
  (not just an implementation bug), say so explicitly and record the reversal with its
  reasoning in the relevant spec/ADR/`STATE.md` entry — don't quietly patch over it as
  if the original decision were still standing.

## Before reporting "done" to the human

State what you actually ran or checked, not just the conclusion — the specific command,
query, or live interaction, and what it returned. If something couldn't be verified
(e.g. a browser tool was disconnected), say that plainly rather than letting it blend
into an otherwise-confident report.
