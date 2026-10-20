# Operations

## Hosting

- Repository: `HyangDan2/GameHub`
- Branch: `main`
- Public URL: `https://hyangdan2.github.io/GameHub/`
- Pages source: GitHub Actions
- Environment: `github-pages`
- Workflow: `.github/workflows/pages.yml`
- Artifact: only `dist/`

Pages setup must exist before the first successful deployment. Inspect the actual repository settings if publication is unavailable. Never add a personal access token to workflow files.

The workflow uses read-only repository access during checks, scoped Pages/OIDC access in the deploy job, and per-ref concurrency. PRs do not deploy. No recurring monitoring is configured.

Workflow requirements were reviewed against [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) on 2026-10-20. Action majors and runtime versions are declared in the repository; review them when upgrading.

## Commands

| Command | Behavior |
| --- | --- |
| `npm ci` | Install the committed lockfile with Node 24.19.0 |
| `npm run dev` | Preview source at `http://127.0.0.1:4173/GameHub/` |
| `npm run validate` | Validate catalog schema, duplicate identity, local images, and evidence references |
| `npm test` | Run deterministic model and validation tests |
| `npm run build` | Validate and recreate `dist/` |
| `npm run test:e2e` | Test existing `dist/` in Chromium under `/GameHub/` |
| `npm run verify` | Run validate, unit tests, build, and browser tests in order |
| `npm run check:links` | Check published external destinations with bounded retries |
| `npm run verify:hosted` | Check public hub cards, assets, destinations, and responsive bounds |

Browser setup: `npx playwright install chromium` locally, adding `--with-deps` for Linux CI.

`PORT` changes the development server port. `SERVE_DIR=dist` serves production output. Browser tests own port 4173 and refuse to reuse an existing server. Run builds and tests sequentially when they share `dist/`.

## Release procedure

1. Read the guides and inspect the current branch/worktree.
2. Implement the catalog or UI change and record relevant evidence.
3. Run `npm run verify` and `npm run check:links`.
4. Review the diff, commit, and use the authorized branch/push workflow.
5. Inspect the Actions run for that exact commit.
6. Confirm Pages deployment success and the post-deploy hosted check.
7. Report the public URL, revision, tests, and any remaining limitations.

An HTTP 200 is not sufficient evidence of gameplay. Manual browser acceptance should inspect real game content and navigation for initial releases or destination changes. Physical iOS/Android compatibility requires actual devices.

## Troubleshooting

- **Assets work at `/` but fail in production:** test `/GameHub/`; use relative paths.
- **No game cards:** check `data/games.json`, browser console, and the retry state.
- **CI network failure:** investigate the destination separately from deterministic tests. Do not silently remove a game or bypass the check while calling it healthy.
- **Pages/OIDC failure:** inspect source setting, environment branch permissions, and deployment-job permissions.
- **Hosted check sees old content:** compare the public catalog with the release, allow normal CDN propagation, then rerun the hosted job. Do not claim success based only on an artifact upload.
- **Local Node too old:** activate the `.nvmrc` version; do not downgrade package requirements to accommodate a machine's default runtime.
- **Return link missing:** apply `GAMEHUB_RETURN_GUIDE.md` through the game's separately authorized workflow.

## Rollback

Identify the last known good commit and the bad change. Revert the offending commit(s) without rewriting shared history, review the revert, and push through the same checks/deployment workflow. Verify the public site and record the recovery.

The hub has no database or migration state. Do not clear browser storage or redeploy games to roll back a hub-only change.

## Maintenance

Keep catalog/schema/renderer changes consistent. Preserve stable game IDs. Track evidence in `docs/onboarding/` and actual test results in `docs/QA.md`. Update guide examples and command tables whenever the interfaces change.

Deployment strips operational evidence/revisions from the public catalog and excludes drafts. Repository documentation and tests are not uploaded.
