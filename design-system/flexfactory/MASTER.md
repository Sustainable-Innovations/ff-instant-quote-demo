# FlexFactory Design System — Master

> Source of truth for building FlexFactory client screens. When building a page, check
> `design-system/flexfactory/pages/[page].md` first; if present it overrides this file.
>
> Derived from the **ui-ux-pro-max** skill (`.claude/skills/ui-ux-pro-max`) reconciled with
> FlexFactory's **existing** brand. The skill's recommended archetype for this product —
> **Marketplace / Directory** built in the **Trust & Authority** style — matches FlexFactory's
> current identity, so we KEEP the established brand and ADOPT the skill's UX rules, marketplace
> section order, trust patterns, and pre-delivery checklist. We explicitly REJECT the skill's
> alt "Liquid Glass" style (it self-flags poor performance + contrast) and do NOT swap the
> brand fonts/colors it generically suggested (Rubik/Nunito, slate navy).

**Project:** FlexFactory · B2B industrial maker-marketplace (KSA) · React 18 + Babel, no bundler.

---

## Brand tokens (authoritative — defined in `index.html :root`)

| Role | Token | Value |
|------|-------|-------|
| Primary / CTA | `--ff-blue` | `#0135F4` |
| Deep primary | `--ff-blue-deep` | `#0C3997` |
| Dark surface | `--ff-navy` | `#070F41` |
| Highlight / reward | `--ff-lime` | `#E1FF05` |
| App background | `--bg` / `--ff-fog` | `#F6F6F6` |
| Card surface | `--surface` | `#FFFFFF` |
| Text | `--ink` / `--ink-2` / `--ink-3` | `#0A0E2A` / `#4A4F6B` / `#8A8FA6` |
| Lines | `--line` / `--line-strong` | `#E6E6E2` / `#D2D2CC` |
| Status | `--pos` / `--neg` / `--warn` | `#0E7C4A` / `#C42B2B` / `#9A6A00` |

- **Fonts:** display `--font-display` (Space Grotesk); UI/body `--font-ui` (IBM Plex Sans). Keep.
- **Shape:** chamfered corners via `.chamfer` / `.chamfer-sm` (clip-path). Keep — it is the brand signature.
- **Numerals:** use `.mono-fig` / `.tnum` (tabular) for all prices, totals, counts, timers.

## Style: Trust & Authority (the skill's match for B2B marketplace)
Lead with credibility. On listings, vendor, detail, and checkout surfaces show: ratings (4.5★+),
verified-vendor / certification badges (ESD-Certified, ISO, etc.), order counts, secure-checkout
markers, and clear pricing. This is the highest-leverage upgrade the skill surfaces for us.

## Page pattern: Marketplace / Directory — section order
1. **Hero (search-focused)** — search is a primary CTA (FlexFactory header search already exists; keep prominent).
2. **Categories** — visual icon tiles for the four verticals (Services · Spaces · Equipment · Materials).
3. **Featured listings** — per-vertical Explore sections (existing).
4. **Trust / Safety** — NEW band: verified vendors, secure checkout, certifications, ratings.
5. **Seller CTA** — "Become a provider" (currently only in footer; elevate).

## Anti-patterns (do NOT use)
- ❌ Playful design · ❌ Hidden credentials · ❌ AI purple/pink gradients · ❌ Liquid-glass / heavy blur as decoration
- ❌ Emoji as icons (use the SVG `Icon` set in `ui.jsx`) · ❌ Missing `cursor: pointer`
- ❌ Layout-shifting hover (scale that reflows neighbors) · ❌ Contrast < 4.5:1 · ❌ 0ms state changes · ❌ Invisible focus

## Interaction & motion (already partly in codebase)
- Transitions 150–300ms (cards/buttons already do `.15–.18s`). Keep.
- `prefers-reduced-motion`: respected in `CountUp`; extend to any new entrance animation.
- Focus: use `.focus-lime` on all new interactive controls (apply consistently — current gap).
- One primary CTA per screen; secondaries subordinate (ghost/secondary buttons).

## Component conventions to reuse (don't reinvent)
`Button` (kinds: primary/secondary/lime/ghost/accent), `Tag`, `Status`, `CornerBadge`, `Stars`,
`Price`/`Riyal`/`SAR2`, `Thumb`, `ListingCard`, `Step` (multi-step), `StatusTracker`,
`MessagesThread`, `Empty`, `Modal`, `useToast`. New screens compose these.

## Forms & checkout rules (for the new cart/checkout + lease/rental flows)
- Multi-step: show a **step indicator** ("Step 2 of 4") — reuse the `Step` component.
- **Inline validation on blur**, not submit-only; error message sits **below** the field; state cause + fix.
- **Submit feedback**: button → loading → success/error (reuse `useToast` + disabled-while-pending).
- **Visible labels** (reuse `Field`/`label`), never placeholder-only. Required marked.
- **Empty states**: cart-empty, no-results, no-orders → message + action (reuse `Empty`).
- Destructive (remove item, cancel) in `--neg`, visually separated from primary.
- Toasts auto-dismiss 3–5s (existing `useToast` ~3.4s ✓), don't steal focus.

## Responsive
Breakpoints already in `index.html`: 1100 / 940 / 640. Verify each new grid at 1440 / 1024 / 768 / 375.
No horizontal scroll; content clears the sticky 72px header.

## Known demo limitations (acknowledge, don't fail review on these)
- No URL routing → no deep-linking/back-button (state-based router). Acceptable for demo.
- No real dark mode (light-only). Trust & Authority supports dark, but out of scope now.

## Pre-delivery checklist (run before calling any screen done)
- [ ] SVG icons only (from `ui.jsx` `Icon`), consistent stroke
- [ ] `cursor: pointer` + `.focus-lime` on every clickable
- [ ] Transitions 150–300ms; reduced-motion respected on entrance anims
- [ ] Text contrast ≥ 4.5:1 (watch `--ink-3` on white for small text)
- [ ] Prices/counts use tabular figures (`.mono-fig`/`.tnum`)
- [ ] Trust signals present where money/decisions happen (badges, ratings, secure-checkout)
- [ ] Multi-step shows progress; forms validate on blur with below-field errors; submit has loading→result
- [ ] Empty/loading/error states handled
- [ ] One primary CTA per screen
- [ ] Responsive 1440/1024/768/375; no horizontal scroll; clears sticky header
