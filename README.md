# HD2Lab GameHub

A small browser arcade connecting Particle Beat, VALKYRIE, and ChibiLink.

**[Open GameHub](https://hyangdan2.github.io/GameHub/)** · [Creation and operations guide](GAMEHUB_GUIDE.md) · [Game return integration](GAMEHUB_RETURN_GUIDE.md)

The hub is static HTML, CSS, and JavaScript. Games launch in the same tab at their existing public URLs. No account, API key, database, or runtime GitHub API is needed.

## Local development

Use Node **24.19.0** (see `.nvmrc`).

```sh
npm ci
npx playwright install chromium
npm run dev
```

Open `http://127.0.0.1:4173/GameHub/`. The preview preserves the production repository subpath.

```sh
npm run verify
npm run check:links
```

Stop the local preview before `verify`: browser tests own port 4173. `verify` runs deterministic checks and browser tests; external destination checks are separate.

## Publish

Successful checks on `main` publish `dist/` through GitHub Actions to GitHub Pages. Pull requests run checks without deploying. A separate job checks the live site after deployment.

See [Operations](docs/OPERATIONS.md) for setup, commands, troubleshooting, and rollback, and [QA](docs/QA.md) for actual verification evidence.

## Add a game

Ask an agent to connect a GitHub repository URL and follow [the onboarding workflow](GAMEHUB_GUIDE.md#5-future-onboarding-from-one-project-url). The workflow inspects the project, finds its actual deployed game, updates `data/games.json`, records evidence, validates, and publishes under the authorized workflow.

This is a repository maintenance workflow, not a public submission endpoint.

Game return links are a separate integration in each game repository. Their outstanding status is recorded in onboarding notes.
