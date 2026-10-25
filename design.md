# Design: LIVV

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal for app screens; Mind stays editorial (proposed, confirm)
- Shape: app screens inside the tab shell. V1 rooms: Daily, Train, Health, Shop, You
- Theme: custom, brand kept (vibe: calm, premium, restrained, stoic-adjacent)
- Posture: every screen is a room, not a dashboard (see BRAND_VOICE.md)

## Tokens
`src/app/globals.css` is the source of truth. Never hardcode past it. Values as of this file:
```css
:root {
  --livv-accent: 15 127 255;        /* #0F7FFF, the one signal colour */
  --livv-bg: #f5f6f8;               /* light is the default theme */
  --livv-surface: 255 255 255;
  --livv-ink: 18 19 22;
  --livv-muted: 74 78 88;
  --livv-border: 170 174 182;
}
html[data-theme="dark"] {
  --livv-bg: #06080b;
  --livv-surface: 16 19 24;
  --livv-ink: 248 249 251;
  --livv-muted: 145 151 161;
  --livv-border: 42 47 56;
}
```
Ember colour in the Shop is `--livv-orange` (#FF9D23). The other palette colours (yellow, red, pink, purple, green) exist as tokens; use them for meaning, not decoration.
Fonts: the system sans stack set in `tailwind.config.ts` (SF Pro, system-ui). No display face is declared.

## Brand (never changed by a redesign)
- The mark is the tall flame-and-L symbol (1:2), with light and dark assets. Wordmark: LIVV.
- LIVV means Longevity, Integrity, Vitality, Vigilance. Core line: Evolve with purpose. Built on LIVV.
- Copy follows `BRAND_VOICE.md`: short sentences, no em dashes, no hustle language, honest empty states.

## Controls
- Inputs and primary buttons on auth: min height 3.25rem, radius 0.7rem, weight 650
- Cards on auth: radius 1.15rem, hairline border, near-flat shadow
- Everything else: match the nearest existing control until audited

## Motion
- Character: calm. One reveal at most. Under reduced motion everything ends at once.
- Not yet verified against `livv-motion.css`. Audit before relying on this line.

## Keep (owner decisions, do not redesign away)
- Daily: one question, three actions, the "a month ago you wrote" callback
- Home's bulletin-board look is intentional. Refine, do not replace
- Connect and Messages are out of V1. Do not re-add tabs or rooms to look bigger
- No wiring changes: email OTP, Stripe and webhooks, Ember awards, cloud sync, routes, ids, test hooks

## Hallmark rules for this repo
- Default depth is polish or restyle. A full redesign needs a file-level plan approved first
- Run `audit` before any change. Do not edit tests to make a run pass
- Run `npm run typecheck`, `npm run shipping:audit` and `npm run build` after any run
- Anything Hallmark's Floor flags that the brand does on purpose gets decided on the record, here, under `## Variants`

## Exports
`globals.css` in this project. Tailwind maps these tokens as `livv.*` in `tailwind.config.ts`.
