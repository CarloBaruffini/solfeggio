# Roadmap

Ideas for the app, in the order we plan to tackle them. Each item gets its own
plan, a page in [features/](features/) and, when it introduces a dependency or an
architectural choice, an ADR in [decisions/](decisions/).

Status: ✅ done · 🚧 in progress · 📋 planned · 💡 idea

| #   | Item                                                                         | Status | Notes                                                                                                     |
| --- | ---------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| 0   | Single-file prototype                                                        | ✅     | Kept in git history (`legacy/note-reading.html` until the port was complete)                              |
| 1   | Foundation: React + TS + Vite, tooling, CI/CD, docs                          | ✅     | ADRs 0001–0005                                                                                            |
| 2   | Port the note-reading exercise with feature parity, PWA                      | ✅     | [features/note-reading.md](features/note-reading.md)                                                      |
| 3   | MIDI keyboard input (Web MIDI API)                                           | 📋     | New `NoteInputSource`. Not supported by Safari / iOS                                                      |
| 4   | Extended keyboard: 61 or 88 keys, scroll/zoom on mobile, "exact octave" mode | 📋     | `Pitch` already carries the octave                                                                        |
| 5   | Grand staff (treble + bass together)                                         | 📋     | Needs a two-stave layout in `notation/`                                                                   |
| 6   | Metronome                                                                    | 📋     | Look-ahead scheduler on the Web Audio clock                                                               |
| 7   | Note durations and rhythm reading                                            | 📋     | Builds on the metronome; timing evaluation in `core/`                                                     |
| 8   | Microphone input for acoustic instruments                                    | ✅     | [features/microphone-input.md](features/microphone-input.md), ADR 0006. Monophonic; chords need ML models |
| 9   | Load scores (MusicXML) and play along                                        | 💡     | OpenSheetMusicDisplay inside `notation/`                                                                  |
| —   | Sampled piano sound                                                          | 💡     | e.g. `smplr`, behind `AudioEngine`                                                                        |
| —   | English UI translation                                                       | 💡     | Strings are already centralised in `src/i18n/`                                                            |
