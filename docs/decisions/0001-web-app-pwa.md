# 0001. Ship a web app (PWA) instead of native apps

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

The app must be usable from several devices (laptop, tablet, phone) without the
cost of building, signing and distributing native apps for each platform. Practice
often happens next to an instrument, sometimes without a reliable connection.

## Decision

Build a single-page web app and make it an installable Progressive Web App:
web app manifest, icons, and a service worker that precaches every asset
(JavaScript, CSS, music font, UI fonts) so the app works offline after the first visit.

## Alternatives considered

- **Native apps (Swift/Kotlin)** — two codebases and store distribution; overkill for the scope.
- **React Native / Expo** — would allow native later, but adds a build and release
  pipeline we do not need today; most music-notation and audio libraries we need are web-first.

## Consequences

- One codebase, deployed by pushing to `main`.
- Platform limits of the web apply: the Web MIDI API is not available in Safari/iOS,
  and audio playback requires a user gesture before it can start.
- Every runtime dependency must be bundled (no CDNs) to keep offline support.
