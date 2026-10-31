# 0005. Host on GitHub Pages with hash routing

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

The app is static (no backend). It must be reachable from any device, deployed
automatically, and free to host.

## Decision

- Deploy the Vite build to **GitHub Pages** from the `deploy` job in
  `.github/workflows/ci.yml`, which runs only on pushes to `main` and only after the
  `check` and `e2e` jobs succeed.
- The site lives at `https://<user>.github.io/solfeggio/`, so Vite's `base` is `/solfeggio/`.
- Use **hash routing** (`/#/route`): GitHub Pages has no fallback to `index.html`
  for unknown paths, and hash URLs work for deep links and the installed PWA alike.

## Alternatives considered

- **Vercel / Netlify** — preview deploys per pull request, but one more account and integration.
- **Path routing with a `404.html` redirect trick** — works, but is fragile and harder to reason about.

## Consequences

- On the GitHub Free plan, Pages requires a **public** repository.
- Pages must be configured with "GitHub Actions" as its source (`build_type=workflow`).
- Public assets must be referenced through `import.meta.env.BASE_URL`, never with absolute `/` paths.
