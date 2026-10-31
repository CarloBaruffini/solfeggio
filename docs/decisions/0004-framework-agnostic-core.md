# 0004. Framework-agnostic core and a single note-input abstraction

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

The prototype mixed music theory, game rules, rendering, audio and input handling in
one script. Upcoming features add new input devices (MIDI keyboard, microphone), a full
88-key range, exact-octave checking and new exercise types.

## Decision

1. **`src/core/` is pure TypeScript.** Music theory (`Pitch`, clefs, naming) and exercise
   rules (generators, session reducers, statistics) never import React, the DOM, Web Audio
   or VexFlow. Randomness and time are passed in, so every rule is unit-testable and deterministic.
2. **Pitches are spelled and absolute.** A `Pitch` is a letter, an accidental and an octave
   (convertible to a MIDI number), not just a pitch class. Today answers are compared by pitch
   class (12 keys); exact-octave comparison is a future option that needs no model change.
3. **Every input produces the same event.** Devices implement `NoteInputSource` and emit
   `NoteInputEvent { midi, source, time }`. The on-screen piano emits the same event. Exercise
   logic never knows which device produced a note.
4. **Session state is a pure reducer** (`useReducer` in the feature hook); persisted
   preferences and records live in a small Zustand store with a versioned `persist` config.
5. **Layering is enforced by ESLint** (`no-restricted-imports`):
   `core ← audio / input / notation ← components / features ← app`.

## Consequences

- Adding MIDI or microphone input means writing one new `NoteInputSource`.
- Features are thin: a hook wires core logic to inputs, audio and notation; components stay presentational.
- A bit more ceremony than putting everything in components, paid back by tests and readability.
