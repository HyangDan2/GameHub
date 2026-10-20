# Quality assurance

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
- First deployment and live hub acceptance: pending the initial workflow run.

## Known boundaries

- Game-side return links are tracked separately and have not been added by this hub task.
- Physical iPhone/Android devices have not been tested.
- Chromium mobile emulation checks hub layout/touch navigation, not hardware-specific input latency or audio.
- Game compatibility labels come from inspected game documentation.
- HTTP availability does not certify a complete gameplay session.
