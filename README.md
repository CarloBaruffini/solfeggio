# Solfeggio

A web app to practise **sight-reading**: it shows random notes on a staff
(treble, bass or alto clef) and you play them on a piano keyboard, on screen
or with your computer keyboard. It works on desktop, tablet and phone, can be
installed as an app (PWA) and works offline.

**Live app:** https://carlobaruffini.github.io/solfeggio/

The user interface is in Italian; code and documentation are in English.

## Getting started

Requirements: Node 24 (see `.nvmrc`) and pnpm (the version is pinned in `package.json`;
`corepack enable` picks it up).

```bash
pnpm install
pnpm dev          # http://localhost:5173/solfeggio/
```

| Script                              | What it does                                               |
| ----------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                          | Dev server with hot reload                                 |
| `pnpm build`                        | Type-check and build the production site into `dist/`      |
| `pnpm preview`                      | Serve the production build locally                         |
| `pnpm lint`                         | ESLint (includes the module layering rule)                 |
| `pnpm typecheck`                    | TypeScript, no emit                                        |
| `pnpm test` / `pnpm test:watch`     | Unit and component tests (Vitest)                          |
| `pnpm test:e2e`                     | End-to-end tests (Playwright) against the production build |
| `pnpm format` / `pnpm format:check` | Prettier                                                   |
| `pnpm generate-pwa-assets`          | Regenerate PWA icons from `public/favicon.svg`             |

The first time you run the end-to-end tests, install the browser with
`pnpm exec playwright install chromium`.

## Deployment

Every push and pull request runs the checks in `.github/workflows/ci.yml`. Pushes to
`main` that pass all checks are deployed to GitHub Pages automatically.

## Documentation

| Document                                     | Content                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | Modules, layering rule, data flow, state, offline support              |
| [docs/features/](docs/features/)             | Behaviour specification of each feature                                |
| [docs/decisions/](docs/decisions/)           | Architecture Decision Records (why things are the way they are)        |
| [docs/roadmap.md](docs/roadmap.md)           | Planned features and their status                                      |
| [docs/glossary.md](docs/glossary.md)         | Italian ↔ English music terms used in the code                         |
| [CHANGELOG.md](CHANGELOG.md)                 | User-visible changes                                                   |
| [CLAUDE.md](CLAUDE.md)                       | Working agreements for AI-assisted development (useful for humans too) |
