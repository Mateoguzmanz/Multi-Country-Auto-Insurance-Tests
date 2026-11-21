# Multi-Country Car Insurance Quoter

A 3-step wizard (Angular 22, standalone/signals) that quotes car insurance for Colombia
and Chile from a single build, with every piece of country-specific content — form
fields, plans, terms and conditions — managed in Strapi 5, not hardcoded in the app.

This repository is the deliverable for a technical test whose real subject is the
**agentic development flow**, not just the application. Start with
[`FLOW.md`](FLOW.md) for the full step-by-step flow, diagram, and reflection answers;
this file covers how to actually run the project.

## Running the project

**Prerequisite:** Docker Desktop installed and **running** — `docker compose up` will
fail immediately if the Docker daemon isn't up yet.

```bash
docker compose up --build
```

That's the single command — no `.env` file, no manual Strapi setup, no seed script to
run by hand. On first boot, Strapi automatically seeds fictitious data for both Colombia
and Chile (form fields, plans, terms and conditions) if its database is empty.

- **App:** http://localhost:4200
- **Strapi admin panel:** http://localhost:1337/admin (first run asks you to create an
  administrator account — this is local-only, not part of the quoting flow)

To stop everything: `docker compose down` (the Strapi database is intentionally not
persisted in a volume — every `up` gets a freshly reseeded dataset instead of risking
stale state; see `docs/adr/0001-multi-country-content-strategy.md` and
`docker-compose.yml`'s comments).

### Running without Docker (local development)

```bash
# Terminal 1 — Strapi
cd apps/cms
npm install
npm run develop   # http://localhost:1337

# Terminal 2 — Angular
cd apps/web
npm install
npm start          # http://localhost:4200
```

## Running the tests

```bash
# Unit tests (Vitest + Angular TestBed)
cd apps/web
npm install
npm test

# End-to-end tests (Playwright) — starts Strapi automatically if it isn't already running
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

## Project layout

```
/
├── FLOW.md                 # the agentic flow: steps, diagram, reflections
├── CLAUDE.md                # conventions every agent (and human) follows
├── docker-compose.yml
├── .claude/
│   ├── agents/               # versioned subagent definitions
│   └── skills/                # versioned skills
├── specs/                     # one spec per user story
├── docs/
│   ├── adr/                    # architecture decision records
│   ├── reviews/                 # per-story code review + a non-functional audit
│   ├── traceability.md          # user story -> spec -> ADR -> code -> tests -> review
│   └── STATE.md                  # the live, append-only decision log kept throughout
├── apps/
│   ├── web/                       # Angular 22 (standalone, signals)
│   └── cms/                        # Strapi 5
├── e2e/                              # Playwright
└── logs/                              # unedited subagent session transcripts
```

## Requirements not fully met (and why)

- **The main orchestrator session log is not included in `logs/`.** The test asks for
  "unedited logs ... of your sessions with the agents." The 9 subagent session
  transcripts *are* included in full, unedited, in `logs/subagents/` (see
  `logs/README.md` for which subagent/phase each one is). The main
  orchestrating session's own log is excluded because it contains the project owner's
  personal email address and Anthropic account identifiers in plain text throughout,
  and this repository is public — including it would expose that information to anyone
  on the internet, not only whoever reviews this test. This was a deliberate,
  user-confirmed decision (see `logs/README.md` and `docs/STATE.md`), not an oversight:
  every decision the main session made is still fully traceable through
  `docs/STATE.md`, `docs/reviews/`, and `docs/traceability.md`.
- **Country selection is a manual, user-visible selector, not automatic geo-detection.**
  Documented upfront as an intentional simplification in
  `docs/adr/0001-multi-country-content-strategy.md` — the test's functional requirements
  don't call for automatic country resolution, and a real strategy for that (domain,
  geolocation, session) is a separate concern from the content-differentiation strategy
  the ADR is actually about.
- **Full keyboard-only operability was verified live per step** (US-01's tab order,
  US-02's native radio-group keyboard semantics, US-03's focus management), and is
  enforced by accessible markup throughout (see `docs/reviews/non-functional-checklist.md`),
  but no single continuous recording exists of tabbing through all 3 steps in one
  uninterrupted session — that would be a nice-to-have capture, not additional
  functionality.
- **"Multiple plans marked `recommended`" is implemented but never exercised against
  real data.** The behavior (render the badge on every flagged plan, per
  `specs/US-02-plan-list.md`'s resolution) is coded and unit-testable, but the seed data
  only ever has one recommended plan per country, so this specific path has only been
  verified by reading the code, not by observing it live.
- **E2E coverage uses Chromium only**, not Firefox/WebKit — the test requires "at least
  one e2e test of the full flow for one country," which is met; cross-browser e2e
  coverage was out of scope for that requirement.
