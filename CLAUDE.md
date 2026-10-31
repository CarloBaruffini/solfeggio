# CLAUDE.md

Working agreements for Claude Code (and humans) in this repository.

## Project

Solfeggio is a sight-reading practice web app, installable as a PWA: it shows random
notes on a staff and the user plays them on a piano keyboard. Static site, no backend,
deployed to GitHub Pages. Read [docs/architecture.md](docs/architecture.md) before
changing structure, and the relevant page in [docs/features/](docs/features/) before
changing behaviour. Future work is in [docs/roadmap.md](docs/roadmap.md).

Languages: **UI in Italian**, **code, comments and docs in English**. The owner speaks
Italian: talk to them in Italian. Use the English music terms from
[docs/glossary.md](docs/glossary.md) in code.

## Commands

```bash
pnpm dev            # dev server at http://localhost:5173/solfeggio/
pnpm lint           # ESLint, including the layering rule
pnpm typecheck
pnpm test           # Vitest (unit + component)
pnpm test:e2e       # Playwright against the production build (desktop + mobile)
pnpm format         # Prettier
pnpm build
```

Before committing: `pnpm format && pnpm lint && pnpm typecheck && pnpm test`.
Also run `pnpm test:e2e` when UI behaviour changes.

## Architecture rules

- Layers: `core ← audio / input / notation ← components / features ← app`.
  ESLint enforces them; never disable the rule, move the code to the right layer.
- `src/core/` is pure TypeScript: no React, DOM, Web Audio, VexFlow or stores. Pass time and
  randomness in (`at`, `Random`) so rules are deterministic in tests.
- Only `src/notation/` imports `vexflow`. Only `src/audio/` uses Web Audio.
- Every input device implements `NoteInputSource` (`src/input/`) and emits `NoteInputEvent`.
  Exercise logic must not know which device produced a note.
- Exercise state lives in a pure reducer in `core/exercises/<exercise>/session.ts`; the feature
  hook owns the side effects (timers, audio, random generation).
- Persisted state uses Zustand `persist` with a `version`; bump it and add a `migrate` when a field
  is renamed, removed or changes type. New fields with a default need neither (`sanitize` + `merge`).
- Cross-module imports use `@/…` through the module's `index.ts`; relative imports only inside a module.
- No hard-coded UI text in components: add it to `src/i18n/it.ts`.
- Styling: a CSS Module next to each component; colours and radii come from the tokens in
  `src/styles/tokens.css`, and every token has a dark-mode value. The staff paper stays light.

## Testing

- Every rule in `core/` has colocated unit tests (`*.test.ts`); use `createSeededRandom` for
  randomness.
- Components: Testing Library, testing behaviour (roles, labels), not markup details.
- End-to-end tests live in `e2e/`. The staff exposes the expected answer as
  `data-current-pitch-class` on `[data-testid="staff"]` so tests can play the right key.
- Audio analysis is tested with synthetic signals (`src/test/signals.ts`) in unit tests, and with
  Chromium's fake microphone in the `microphone` Playwright project (`e2e/fakeMicrophone.ts`).

## Documentation rules (mandatory, same commit as the change)

- Behaviour change → update `docs/features/<feature>.md`.
- New dependency, module, layer or architectural choice → new ADR in `docs/decisions/`
  (copy `0000-template.md`, next free number). Superseded ADRs are marked, not deleted.
- User-visible change → `CHANGELOG.md` under "Unreleased".
- Roadmap item started or finished → `docs/roadmap.md`.
- Structure or data-flow change → `docs/architecture.md`.
- Exported functions and types in `core/` have TSDoc comments.

## Conventions

- TypeScript strict, no `any`, no enums (use string-literal unions; `erasableSyntaxOnly` is on).
- Function components with named exports. One folder per component:
  `Piano/Piano.tsx`, `Piano.module.css`, `Piano.test.tsx`, `index.ts`.
- Hooks are named `useSomething` and live next to the feature that uses them.
- Commits: imperative summary of at most 72 characters, body explains why. Work on a branch;
  `main` deploys automatically.

## Gotchas

- VexFlow 5 draws glyphs as text in the Bravura font: render only after `loadNotationFonts()`
  resolves, otherwise metrics are wrong.
- VexFlow sets the width of the element it renders into: measure the parent, never the target.
- Browsers block audio until a user gesture; `AudioEngine` resumes its context on the first note.
  Open the microphone from the gesture's handler too (`useMicrophoneInput().start`).
- The app must stay silent while the microphone listens, or it hears itself and answers twice.
- Microphone analysis runs on `requestAnimationFrame`: it pauses in background tabs and crawls
  (1–2 fps) in throttled previews such as the Claude browser pane, which also blocks the real
  microphone there. Check detection with unit tests and the fake-microphone e2e project.
- The app is served under `/solfeggio/` (Vite `base`) with hash routing: reference public assets
  through `import.meta.env.BASE_URL`, and use `#/…` links.
- TypeScript is pinned to 6.0.x until typescript-eslint supports 7 (see ADR 0002).
