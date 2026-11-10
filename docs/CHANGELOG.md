# Changelog

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
