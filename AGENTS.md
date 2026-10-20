# GameHub agent entry point

Read `GAMEHUB_GUIDE.md` before implementation or onboarding. Read `docs/OPERATIONS.md` before deployment. For game-side changes, use `GAMEHUB_RETURN_GUIDE.md` in the relevant repository.

## Fixed contract

- Repository: `HyangDan2/GameHub`.
- Public URL: `https://hyangdan2.github.io/GameHub/`.
- Static HTML/CSS/JavaScript with catalog-driven rendering.
- `data/games.json` is the only game list. Do not hardcode cards.
- Keep documentation in English and the current UI in Korean.
- Preserve independent game deployments and existing game storage.
- The current task authorizes hub implementation and Pages deployment. Game-side return links are tracked separately; do not silently modify other repositories.

## Commands

Use Node 24.19.0 (`.nvmrc`) and `npm ci`.

- `npm run verify`: schema/assets/evidence validation, unit tests, build, Chromium browser checks.
- `npm run check:links`: independent network destination checks.
- `npm run verify:hosted`: deployed-site acceptance.
- `npm run dev`: preview at `http://127.0.0.1:4173/GameHub/`.
- `npm run test:e2e`: uses an existing `dist/`; run build first if source changed.

Install Chromium with `npx playwright install chromium` locally, or `npx playwright install --with-deps chromium` in Linux CI. Do not run a preview on port 4173 concurrently with browser tests.

## Onboard a project from its URL

Inspect the supplied repository and deployed game, record its revision and evidence, normalize the repository identity, add/update one catalog entry, reuse authorized imagery or the fallback, validate, and use the authorized publishing workflow. Do not infer unsupported capabilities or invent a play URL. A repeated request updates the same entry.

Update `docs/onboarding/<id>.md`, `docs/CHANGELOG.md`, and relevant QA evidence. Report physical-device testing separately from emulation. Do not claim the full hub-to-game-to-hub flow is complete while return integration remains pending.
