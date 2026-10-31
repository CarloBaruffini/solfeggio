# 0002. React, TypeScript and Vite

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

The prototype was a single HTML file with vanilla JavaScript. Planned features
(MIDI and microphone input, full keyboard, grand staff, metronome, rhythms, score
loading) need a structure that stays readable as the app grows, strong typing for
music-theory code, and an ecosystem of tested libraries.

## Decision

- **React 19** for the UI, written as function components and hooks.
- **TypeScript** in strict mode with `noUncheckedIndexedAccess` and `erasableSyntaxOnly`.
- **Vite** as dev server and bundler; **pnpm** as package manager; Node 24.
- **Zustand** for the few pieces of persisted, app-wide state (settings, records).
- **CSS Modules** plus global design tokens (CSS custom properties) for styling.
- **Vitest + Testing Library** for unit/component tests, **Playwright** for end-to-end tests.
- **ESLint** (typescript-eslint strict type-checked, react-hooks, jsx-a11y) and **Prettier**.

Version notes at the time of writing:

- TypeScript is pinned to **6.0.x** because typescript-eslint does not support TypeScript 7 yet.
- ESLint **10** is used even though `eslint-plugin-jsx-a11y` only declares support up to 9;
  the plugin works, and the peer warning is silenced in `pnpm-workspace.yaml`.

## Alternatives considered

- **Svelte 5** — less boilerplate, but a smaller ecosystem and fewer examples of the current syntax.
- **Vue 3** — viable; fewer music/testing libraries and examples than React.
- **Next.js / Remix** — server rendering brings nothing to an offline-first app with no backend.
- **Tailwind CSS** — fast to write, but the existing design is already expressed as tokens and
  plain CSS reads better for this size of project.

## Consequences

- Business logic must not live in components (see [0004](0004-framework-agnostic-core.md)),
  so that the UI framework stays a thin, replaceable layer.
- Revisit the TypeScript pin when typescript-eslint supports TypeScript 7.
