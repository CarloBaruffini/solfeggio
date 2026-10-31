# 0003. Render notation with VexFlow behind an adapter

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

We need to draw staves in treble, bass and alto clef with notes, accidentals and
ledger lines, colour individual notes, and know where each note is drawn (to place
the cursor). Later we will need durations, beams, a grand staff and MusicXML scores.

## Decision

Use **VexFlow 5** from npm, imported from the `vexflow/bravura` entry point, which
embeds the Bravura music font as a data URL (no network access needed). All VexFlow
code lives in `src/notation/`; the rest of the app passes plain data
(`Clef`, `Pitch`, a display state) to `<StaffView>`.

## Alternatives considered

- **Hand-drawn SVG** — full control, but clefs and glyph metrics are a lot of work to get right.
- **abcjs** — great for ABC notation, less flexible for per-note styling and custom layouts.
- **OpenSheetMusicDisplay (OSMD)** — renders MusicXML on top of VexFlow; a good fit for the
  future "load a score" feature, too heavy for generated exercises. It can be added later
  inside `src/notation/` without touching the rest of the app.

## Consequences

- VexFlow 5 draws glyphs as text in the Bravura font: we must wait for the font to load
  (`loadNotationFonts()`) before measuring or rendering.
- VexFlow sets the width of the element it renders into; measure the parent container instead.
- Swapping or adding a notation engine only touches `src/notation/`.
