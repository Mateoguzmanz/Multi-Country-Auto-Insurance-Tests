# Non-functional checklist — Phase 9

Cross-cutting audit of accessibility, responsive layout, and security, performed after
US-01/02/03 (Phases 6-8) were individually built and code-reviewed. Each item lists how
it was checked and its result. Items marked "pending live confirmation" are implemented
and code-verified but not yet confirmed by an actual click-through, because the Chrome
browser extension was disconnected for this session during Phase 8/9 (see
`docs/STATE.md`); they should be re-confirmed once Chrome reconnects or via the Phase 10
Playwright e2e suite, whichever comes first.

## Accessibility

| Item | Status | How checked |
|---|---|---|
| Every input has a programmatically associated label | ✅ Done | Code audit of all three pages: every `<input>`/`<select>`/checkbox has a matching `[for]`/`id` pair (US-01's dynamically generated fields included) or is wrapped in a `<label>` (US-02's radio cards). |
| Error/help text linked via `aria-describedby` | ✅ Done | US-01: `describedBy()` combines help + error ids per field. US-03: terms checkbox has `aria-describedby="terms-help"`. |
| Full wizard operable by keyboard only | ✅ Code-verified for US-01/US-02 (live), pending live confirmation for US-03 | US-01 and US-02 were driven with real keyboard events (Tab, Space, Arrow keys) via the browser during their own phase reviews and worked via native control semantics. US-03 uses the same native-control approach (checkbox, button) so the same keyboard semantics apply, but was not re-confirmed live after the Chrome disconnect. |
| Visible focus indicators | ✅ Done | Every interactive element across all three pages has an explicit `:focus-visible` outline rule in its `.scss` (confirmed by reading all three stylesheets); no default browser focus ring is suppressed anywhere. |
| Loading/processing states announced to assistive tech | ✅ Done | `role="status" aria-live="polite"` on loading states (all 3 pages) and on the "Processing your payment…" state; `role="alert"` on error/rejection states. |
| Focus moves to the result after an action | ✅ Code-verified, pending live confirmation | US-03's `afterRenderEffect` calls `.focus()` on the confirmation or error panel (both have `tabindex="-1"`) when `paymentStatus()` changes — correct by code inspection, not yet observed live. |
| "Recommended" plan distinguishable without relying on color alone | ✅ Done | Rendered as a visible text badge ("RECOMMENDED"), confirmed live during Phase 7's review, not just a CSS color/class. |
| Sensitive identifiers masked in the UI | ✅ Done | Document number masked per the spec's algorithm; hand-verified against all 4 of the spec's worked examples during Phase 8's review (see `docs/STATE.md`). |

## Responsive

| Item | Status | How checked |
|---|---|---|
| Viewport meta tag present | ✅ Done | Confirmed in `apps/web/src/index.html` (`width=device-width, initial-scale=1`), required for any responsive CSS to apply on real mobile browsers. |
| US-01 form reflows on narrow viewports | ✅ Done | CSS Grid `repeat(auto-fit, minmax(220px, 1fr))` — collapses to a single column below ~460px without needing a breakpoint; structurally responsive by construction. |
| US-02 plan list reflows on narrow viewports | ✅ Done | Single-column flex layout by default (never multi-column), plus an explicit `@media (max-width: 40rem)` padding adjustment. |
| US-03 summary reflows on narrow viewports | ✅ Done | Grid of cards collapses via `auto-fit`, plus an explicit `@media (max-width: 40rem)` rule that stacks the data rows and nav links vertically. |
| Global baseline (box-sizing, body margin) | ✅ Fixed during this pass | `apps/web/src/styles.scss` was still the empty Angular CLI default; added a `box-sizing: border-box` reset and removed the default body margin, since per-component styles alone don't guard against that. Rebuilt clean afterward. |
| Generic placeholder page `<title>` | ✅ Fixed during this pass | Was still the CLI default `"Web"`; changed to `"Car Insurance Quote"`. |

## Security

| Item | Status | How checked |
|---|---|---|
| No write-enabled (or any) Strapi API token in the front end | ✅ Done | `grep`-audited all of `apps/web/src` for `token`/`Bearer`/`Authorization`/`apiKey` — the only matches are an unrelated local variable (`refreshToken`, a cache-busting counter in `CountryContentService`, nothing to do with auth). `environment.ts`/`environment.prod.ts` contain only a public base URL, no credentials. |
| Strapi Public role limited to `find`/`findOne` | ✅ Done (re-confirmed from Phase 4) | Verified against the live database and live API in Phase 4: exactly 6 permissions (find/findOne × 3 content-types) granted to the Public role; `POST`/`PUT` against the API return HTTP 403. |
| No real payment gateway or real card data anywhere | ✅ Done | `SimulatedPaymentService` never calls an external endpoint; no card-number field exists anywhere in the UI; all payment data is explicitly labeled simulated in code comments and the spec. |
| Fictitious data only in seed content | ✅ Done (confirmed during Phase 4) | All seeded names/documents/emails/phones are made up; no real personal data. |

## Summary

Everything above is either fully done and live-confirmed, or implemented and
code/hand-verified with only the *observation* step outstanding due to the Chrome
extension disconnect. Two small polish items (global style baseline, page title) were
found and fixed during this pass. Nothing here is a functional gap — the remaining
"pending live confirmation" items are a verification-method gap, to be closed by Phase
10's e2e suite or a manual Chrome pass.
