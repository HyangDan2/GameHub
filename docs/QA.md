# Quality assurance

## 2026-11-07 — Four-game deployment repair

- Node 24.19.0 with `npm ci`: `npm run verify` passed catalog validation, 7 unit tests, production build, and 12 Chromium browser tests.
- `npm run check:links`: all four published game destinations returned HTTP 200 at their expected HTTPS URLs.
- Browser checks cover 360, 390, 768, and 1440 pixel widths, keyboard and emulated touch navigation, catalog retry, image fallback, draft/unavailable behavior, safe text rendering, long text, and reduced motion.
- The browser tests now derive visible card counts from catalog status and identify navigation targets by stable game ID. The prior two Actions runs failed in verification before Pages deployment.
- Physical-device testing was not performed. Game-side return integration is tracked separately.

## Scope

This file records hub validation. Game mechanics and physical-device playability are not certified by hub tests.

Initial review date: 2026-10-20.

## Validation

- Runtime: Node 24.19.0; locked npm dependencies.
- `npm run verify`: passed (7 deterministic tests and 12 Chromium browser tests).
- `npm run check:links`: all three game URLs returned HTTP 200 without changing destination.
- Browser coverage: 360, 390, 768, and 1440 pixel widths; same-tab destinations, keyboard focus/Enter, emulated touch, reduced motion, long text, missing image fallback, catalog retry, unavailable/draft handling, and safe text rendering.
- Visual review: full-page desktop (1440 px) and mobile (390 px) screenshots inspected. See [desktop](evidence/desktop.png) and [mobile](evidence/mobile.png).
- Pages configured with the GitHub Actions publishing source.
- First production release: `c5de6f104bb3eb561137ede037af2209496ea083`.
- [Release workflow](https://github.com/HyangDan2/GameHub/actions/runs/39371219990): verification and Pages deployment succeeded.
- `npm run verify:hosted`: passed against `https://hyangdan2.github.io/GameHub/`; three cards, local images, destinations, and desktop/mobile bounds verified.
- Live browser navigation: clicked each published play link from the public hub; all three reached their expected URL and actual game title.
- Destination smoke checks: activated each game's start button; confirmed the Particle Beat rhythm highway after audio decoding, the VALKYRIE game scene, and the ChibiLink tile board. These are startup checks, not complete gameplay sessions or audio listening tests.
- This evidence-only follow-up does not alter the deployed public files.

## Known boundaries

- Game-side return links are tracked separately and have not been added by this hub task.
- Physical iPhone/Android devices have not been tested.
- Chromium mobile emulation checks hub layout/touch navigation, not hardware-specific input latency or audio.
- Game compatibility labels come from inspected game documentation.
- HTTP availability does not certify a complete gameplay session.

## 2026-10-21 — Web-HQ navigation

- Changed the header destination to `https://hyangdan2.github.io/`, labeled Web-HQ, using same-tab navigation.
- Confirmed the live Web-HQ HTML already contains a GameHub card linking to `https://hyangdan2.github.io/GameHub/`.
- Node 24.19.0 with `npm ci`; `npm run verify` passed (7 unit tests, 12 Chromium browser tests, validation and production build).
- `npm run check:links` passed for all three published games (HTTP 200).
- Browser layout coverage includes 360, 390, 768, and 1440 pixel widths; physical devices were not tested.
- Production publication and hosted acceptance run through the Pages workflow for this release.

## 2026-11-10 — HD2Lab brand alignment review

- `npm run verify` passed on a fresh build: catalog/schema/assets/evidence validation (`Catalog valid: 4 games`), 7 deterministic tests, and 13 Chromium browser tests (the 12 existing checks plus a brand header, cross-hub link, and icon link check).
- Visual review: full-page desktop (1440 px) and mobile (390 px) screenshots were retaken after the palette, mark, and navigation change. See [desktop](evidence/desktop.png) and [mobile](evidence/mobile.png).
- Scope: markup, styles, favicons, share image, and hub links only. The game catalog, play destinations, storage behavior, and deployment workflow are unchanged.
- Merge and hosted acceptance (`npm run verify:hosted`) are still pending; no claim is made about the deployed site in this review.
