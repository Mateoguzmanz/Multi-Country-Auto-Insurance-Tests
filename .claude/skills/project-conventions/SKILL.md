---
name: project-conventions
description: Templates and checklists for this project — spec template, ADR template, code-review report template, and the accessibility/security checklist. Use whenever drafting a new spec, ADR, or review file, or when unsure how one should be structured.
---

# Project conventions

Use these templates verbatim as the starting structure for new files; fill them in, don't
restructure them. All content goes in English, per `CLAUDE.md`.

## Spec template — `specs/US-0X-slug.md`

```markdown
# US-0X — <Title>

Status: Draft — pending review

## Story
<verbatim>

## Business rules
<verbatim list>

## Acceptance criteria

\`\`\`gherkin
<verbatim Gherkin>
\`\`\`

## Gaps and edge cases
-

## Data contract

\`\`\`ts
interface Example {}
\`\`\`

## Definition of done
- [ ]

## Open questions
-
```

## ADR template — `docs/adr/NNNN-slug.md` (MADR-style)

```markdown
# NNNN. <Title>

Status: Proposed

## Context and problem statement

## Decision drivers
-

## Considered options
1.
2.
3.

## Decision outcome

Chosen option: "...", because ...

### Consequences
- Good: ...
- Bad: ...
```

## Code review report template — `docs/reviews/US-0X.md`

```markdown
# Review — US-0X

## Findings
| # | File | Issue | Severity | Resolution |
|---|---|---|---|---|

## Verdict
Approved / Approved with changes / Rejected
```

## Accessibility & security checklist

Apply before marking any story done:

- [ ] Every input has a programmatically associated label.
- [ ] Every error/help text is linked via `aria-describedby`.
- [ ] The full wizard is operable with keyboard only (logical tab order, visible focus, no
      keyboard traps).
- [ ] No write-enabled Strapi token appears in any file under `apps/web/` or in build
      output.
- [ ] Strapi Public role has only `find` / `findOne` on read content-types.
- [ ] Sensitive identifiers (document numbers) are masked in the UI.
