# 0006. Microphone input: AnalyserNode capture, McLeod pitch detection, note tracker

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

The owner wants to answer by playing a real instrument: a digital piano through its
speakers, a guitar, or a bowed string instrument. The app must work in mobile browsers
(including iOS Safari) and offline, with no backend. Answers are compared by pitch class, so
octave errors of the detector do not matter, but a single played note must count exactly
once, and repeated notes (two F in a row) must count twice.

## Decision

1. **Capture** (`src/audio/microphone.ts`): `getUserMedia` with echo cancellation, noise
   suppression and automatic gain **off** (they distort pitch), into an `AnalyserNode` on the
   app's single `AudioContext`. The analyser reaches the destination through a zero gain, as some
   browsers only process connected nodes. Errors are mapped to `denied`, `unavailable`,
   `unsupported` and `failed`, so the UI can say what to do.
2. **Analysis loop** on `requestAnimationFrame`: one window of 2048 samples (about 43 ms at
   48 kHz) per frame, read with `getFloatTimeDomainData`.
3. **Pitch detection** with the McLeod pitch method from [`pitchy`](https://github.com/ianprime0509/pitchy)
   (MIT, about 10 kB with `fft.js`), wrapped in `createPitchAnalyzer` (`src/input/microphone/`),
   which also measures RMS loudness and discards frequencies outside 50–2000 Hz.
4. **Note tracking** in our own pure `createNoteTracker`: a note starts when one semitone stays
   clear (clarity ≥ 0.85) and loud enough (RMS ≥ 0.01) for 50 ms; a sounding note counts once
   and can count again only after 80 ms of silence or a new attack (loudness × 1.8 within 120 ms,
   at least 150 ms after the previous note). Notes are compared by pitch class with 0.2 semitones
   of hysteresis, so octave jumps of the detector and out-of-tune vibrato never add notes.
5. **The app is silent while the microphone setting is on**: it would otherwise hear its own
   synthesized piano and count it as a second answer.
6. `src/input/` does not import `src/audio/`: the microphone source reads from a structural
   `SampleReader`, and the feature hook passes it the `MicrophoneCapture`.

## Alternatives considered

- **Our own YIN / MPM implementation** — avoids a dependency, but `pitchy` is small, tested and
  allocation-free; it sits behind `createPitchAnalyzer`, so it can be replaced later.
- **AudioWorklet** for the analysis — runs off the main thread and keeps going in background tabs,
  but needs a separately served module (base path, service worker precache) for no benefit at
  60 analyses per second on a visible page.
- **Machine-learning models (CREPE, Basic Pitch)** — more robust and polyphonic, but megabytes of
  weights and much more CPU on phones; reconsider for chords.
- **Web MIDI for digital pianos** — exact and immediate, but not available on Safari/iOS and not an
  option for acoustic instruments; it stays on the roadmap as a separate input.

## Consequences

- Any instrument works without setup, on any device with a microphone and an HTTPS page.
- Detection is monophonic: chords are not recognised.
- Latency is about 100 ms (window + stability time): fine for reading notes, to be revisited
  for rhythm exercises.
- Analysis pauses in background tabs and slows down in throttled previews; end-to-end tests use
  Chromium's fake microphone (`--use-file-for-fake-audio-capture`) instead.
- The thresholds are exported constants in `noteTracker.ts`, tuned with synthetic signals
  (`src/test/signals.ts`); real instruments may call for adjustments or a sensitivity setting.
