# Changelog

## 2026-11-16 — Soft Iris (white & violet) design language

- Re-skinned the hub to the Soft Iris tokens from `HyangDan2/Server-HQ` (`HD2Lab/hub-common.css`): `--bg #FAFAFD`, `--panel #FFFFFF`, `--panel-soft #F4F1FC`, `--line #E8E4F2`, `--line-strong #D4CCE8`, `--ink #1D192B`, `--muted #68627A`, `--dim #8A839C`, `--accent #8B6CE8`, `--accent-hover #7655D9`, `--accent-text #6B4CD6`, `--accent-soft #F1ECFE`, `color-scheme: light`. Small accent labels (nav-current, count, card kicker, orientation, guide numbers) use `--accent-text`; primary buttons are `#8B6CE8` with white text.
- Re-inked the hero gamepad art for the light ground: white shell on an `#E3DBFD` hairline, `#E7E1F9`/`#D4CCE8` stacked shadow, `#C4B5FD` D-pad, `#DDD3FB`/`#7655D9` face buttons, `#A78BF0` D-pad centre, and violet orbit rings, crosses, and radial wash at low alpha.
- Card, chip, search, play-link, and footer surfaces moved to the light palette; the missing-thumbnail placeholder (`assets/games/placeholder.svg`) was re-inked from the old green to `#F4F1FC`/`#D4CCE8`/`#8B6CE8`.
- Regenerated the favicon set (`favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`, `favicon.ico`) and `assets/branding/share.png` (1200×630) in Soft Iris on the unchanged card skeleton; `og:image`/`twitter:image` cache buster → `?v=20261116-soft-iris`, `theme-color` → `#FAFAFD`.
- Tightened the mobile header nav (10px, 10px gap) so the four cross-hub links fit a 390px screen instead of clipping "Web-HQ".
- Tests: `npm run verify` (validate, unit, build, 13 Chromium checks) and `npm run check:links` pass; headless 1440×900 and 390×844 render with 0 console errors, 0 horizontal overflow, and no element outside the viewport.

## 2026-11-10 — English interface

- Localized the whole interface to English: page title and meta tags, skip link, header navigation ("Browse Games"), hero copy and CTA ("Find a Game ↓"), collection heading and note, loading, empty, error, and retry messages, guide section, collection bottom bar, card captions ("Official Art" / "Gameplay Screen"), input and orientation labels, and the play action ("Play Now ↗" with `aria-label="Play <title>"`).
- Translated the four catalog descriptions in `data/games.json`; titles, subtitles, thumbnails, and play URLs are unchanged.
- Updated the Chromium suite to the English labels and matched play links by exact accessible name so "VALKYRIE" no longer resolves "VALKYRIE EIRA".

## 2026-11-10 — HD2Lab brand alignment

- Switched the palette from lime green to the HD2Lab signature orange (`--accent: #ff824f`) on the `#101110` ground.
- Replaced the gamepad logo with the HD2Lab dual-skew mark and set the header brand to `HD2Lab / GameHub`.
- Added ApplicationHub, TechnicalHub, and Web-HQ links to the global navigation.
- Synced the standard HD2Lab favicon set (SVG, ICO, 32 px, 180 px Apple touch icon) and regenerated the 1200×630 share image.
- Added a browser check that covers the brand header, cross-hub links, and icon links.

## 2026-11-07 — Four-game deployment repair

- Updated browser checks to derive visible card counts from catalog status and select game destinations by stable ID, restoring validation after VALKYRIE EIRA joined the catalog.

## 2026-10-21 — Web-HQ navigation

- Replaced the header GitHub repository link with a same-tab Web-HQ link to `https://hyangdan2.github.io/`.
- Confirmed Web-HQ already links to GameHub, completing the navigation path between the two hubs.

## 2026-10-20 — Initial hub

- Added a responsive arcade gallery for Particle Beat, VALKYRIE, and ChibiLink.
- Added keyboard/touch navigation, orientation guidance, image fallback, and catalog retry.
- Added local game imagery and share metadata.
- Added a versioned catalog, schema validation, onboarding provenance, unit tests, and production browser checks.
- Added GitHub Pages verification, publication, and post-deployment acceptance.
- Preserved independent game deployments. Game-side return integrations remain a separate task.
