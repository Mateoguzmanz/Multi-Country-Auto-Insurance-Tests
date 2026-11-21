# Project Context — Multi-Country Car Insurance Quoter

A wizard-style front end (Angular) that quotes car insurance for Colombia and Chile from a
single build. All country-specific content — form fields, plans, copy, terms — is managed
in Strapi, not hardcoded in the app.

This file is the single source of truth for conventions. Every agent (and every human
contributor) follows it without exception. If a task seems to require breaking a rule here,
stop and raise it as a human-in-the-loop checkpoint instead of breaking it silently.

Read `docs/STATE.md` before starting work in a new or resumed session — it holds the
current phase and the decisions already made, so you don't re-derive or contradict them.

## Language

- Code, identifiers (variables, functions, services, components, files), comments, commit
  messages, specs, ADRs, and all repo docs are written in **English only**. No exceptions,
  no mixed-language identifiers.
- Default to **no comments**. Only comment a non-obvious *why* (a regulatory constraint, a
  workaround, a subtle invariant) — never restate what the code already says. Never leave a
  comment that references "AI", "generated", the task/ticket that produced the code, or a
  caller's name.

## Angular (21+)

- Standalone components only — no `NgModule`.
- Use **signals** for component/local state. Use the built-in control flow (`@if`, `@for`,
  `@switch`) — never `*ngIf` / `*ngFor` / `*ngSwitch`.
- Every component ships as **three separate files**: `*.component.ts`, `*.component.html`,
  `*.component.scss`. Never use inline `template` or `styles` in the `@Component` decorator.
  Logic lives only in `.ts`; markup only in `.html`; do not mix the two.
- Type everything against the Strapi data contract defined in the relevant spec. No `any`.
- Handle `loading` / `error` / `empty` states explicitly wherever a spec implies them.
- Accessibility is not optional: labels programmatically tied to inputs, `aria-describedby`
  for help/error text, visible focus, full keyboard operability for the whole wizard.
- Prefer small, focused services. If a piece of work seems to need a facade service or any
  architectural pattern not already named in this file, **stop and flag it to the human**
  instead of introducing it silently.

## Strapi (5+)

- Public role permissions are limited to `find` / `findOne` on read-only content-types.
  Never grant `create` / `update` / `delete` to Public. Any broader permission must be
  justified in an ADR first.
- No write-enabled API token is ever embedded in a file that ships to the browser
  (`apps/web/**` source or build output). If the front end needs to read Strapi, it does so
  either through the Public role or a read-only token — never a token with write scope.
- Seed/bootstrap data is fictitious only, covering both Colombia and Chile.

## Spec-Driven flow

For every user story:

```
user story → spec (specs/) → ADR if it implies an architectural decision (docs/adr/)
  → implementation → tests → code review (docs/reviews/) → traceability entry (docs/STATE.md)
```

No implementation starts before its spec is approved by the human reviewer.

## Human-in-the-loop checkpoints (mandatory pause points)

Stop and wait for explicit human approval before proceeding past:

1. Any ADR (architecture decision).
2. The multi-country content strategy and anything touching Strapi permissions/security.
3. Each spec, before implementation of that story begins.
4. Introducing a new architectural pattern not already in this file (e.g. a facade, a new
   state-management approach).

Routine, reversible steps (drafting a spec, writing a test, a small refactor) don't need a
pre-approval gate — present the finished result for review instead of asking permission
first.

## State tracking

`docs/STATE.md` is the live, append-only decision log: what's been decided, its approval
status, and the current phase. Update it after each checkpoint; never rewrite history,
only append.

## Testing

- Unit tests colocated with the code they test (`*.spec.ts`).
- E2E tests in `e2e/` (Playwright), covering at minimum the full wizard flow for one
  country, the invalid-field scenario, and the rejected-payment scenario.
- A test must assert behavior tied to an acceptance criterion in a spec — never just
  "renders without throwing" or "compiles".

## Repository layout

```
/
├── README.md
├── FLOW.md
├── CLAUDE.md
├── docker-compose.yml
├── .claude/
│   ├── agents/        # versioned subagent definitions
│   └── skills/        # versioned skills
├── specs/             # one file per user story
├── docs/
│   ├── adr/           # architecture decision records
│   ├── reviews/        # code review reports per story
│   └── STATE.md        # live decision/status log
├── apps/
│   ├── web/            # Angular 21+
│   └── cms/            # Strapi 5+
└── e2e/                # Playwright tests
```

## Commit messages

Conventional Commits, in English, imperative mood (`feat:`, `fix:`, `docs:`, `test:`,
`chore:`). No AI attribution noise beyond what the governing attribution policy requires.
