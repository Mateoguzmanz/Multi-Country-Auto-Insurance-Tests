# Agent session logs (unedited)

This folder contains the raw, unedited JSONL session transcripts for every subagent
spawned during this project — exactly as Claude Code wrote them, not summarized or
cleaned up. One pair of files per subagent run:

| File | Subagent | Phase |
|---|---|---|
| `agent-aspec-us-01-*` | `spec-writer` | Phase 2 — US-01 spec |
| `agent-aspec-us-02-*` | `spec-writer` | Phase 2 — US-02 spec |
| `agent-aspec-us-03-*` | `spec-writer` | Phase 2 — US-03 spec |
| `agent-astrapi-phase4-*` | `strapi-architect` | Phase 4 — Strapi content-types, permissions, seed |
| `agent-aangular-phase5-*` | `angular-builder` | Phase 5 — Angular base scaffolding |
| `agent-aangular-phase6-us01-*` | `angular-builder` | Phase 6 — US-01 implementation |
| `agent-aangular-phase7-us02-*` | `angular-builder` | Phase 7 — US-02 implementation |
| `agent-aangular-phase8-us03-*` | `angular-builder` | Phase 8 — US-03 implementation |
| `agent-atest-phase10-*` | `test-writer` | Phase 10 — unit + e2e tests |

Each `.jsonl` is the full transcript (every message and tool call); each matching
`.meta.json` is the subagent's run metadata.

## What's intentionally not here

The main orchestrator session log (the conversation that coordinated all of the above,
reviewed every result, and made every approval/rejection decision) is **not** included.
It contains the project owner's personal email address and Anthropic account
identifiers in plain text throughout, and this repository is public — including it would
expose that information to anyone on the internet, not just whoever is reviewing this
test. This is a deliberate, disclosed decision (see `README.md`'s "Requirements not
fully met" section), not an oversight: every decision the main session made is still
fully traceable through `docs/STATE.md` (the append-only decision log), the per-story
reviews in `docs/reviews/`, and `docs/traceability.md`.
