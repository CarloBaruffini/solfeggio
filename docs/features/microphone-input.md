# Microphone input ("Microfono")

The user answers by playing a real instrument (digital piano, guitar, strings, voice…) into
the device's microphone. It works alongside the on-screen piano and the computer keyboard.

Code: `src/audio/microphone.ts` (capture), `src/input/microphone/` (pitch detection and note
tracking), `src/features/microphone/` (hook and status panel). Decision record:
[0006](../decisions/0006-microphone-pitch-detection.md).

## Using it

- The **Microfono** switch (in the settings bar) turns it on; the browser asks for permission
  the first time. The setting is remembered (`microphone` in `solfeggio:settings`).
- After a reload with the switch on, browsers need a tap before audio can start: the panel
  shows **"Attiva il microfono"**.
- Turning the switch off releases the microphone (the browser's recording indicator goes off).
- While the setting is on, **the app plays no sound**, or the microphone would hear it and count
  it as an answer. The panel says so.
- Any octave is accepted: answers are compared by pitch class, like the on-screen piano.
- One note at a time: chords are not recognised.

## Status panel

Shown above the piano while the setting is on.

| Status         | What the user sees                                                    |
| -------------- | --------------------------------------------------------------------- |
| `listening`    | "🎤 In ascolto", a level meter, "Sento: <note>" (or "—")              |
| `needsGesture` | "Il microfono è acceso nelle impostazioni." + **Attiva il microfono** |
| `starting`     | "Avvio del microfono…"                                                |
| `denied`       | How to allow the microphone in the browser settings + **Riprova**     |
| `unavailable`  | No microphone, or it is used by another app + **Riprova**             |
| `unsupported`  | The browser cannot record (e.g. a page not served over HTTPS)         |
| `failed`       | Any other error + **Riprova**                                         |

The level meter spans −60 dBFS (empty) to 0 dBFS (full); the note shown is the nearest
semitone of what is heard right now, even when it does not count as an answer yet.

## Detection

Once per animation frame, the latest 2048 samples (about 43 ms at 48 kHz) are analysed with
the McLeod pitch method, giving a frequency (50–2000 Hz), a clarity (0–1) and the RMS loudness.
The exercise range is B♭1 (58 Hz) to D♯6 (1245 Hz).

The note tracker turns these frames into answers:

| Rule                                                                                           | Constant (`noteTracker.ts`)      | Value               |
| ---------------------------------------------------------------------------------------------- | -------------------------------- | ------------------- |
| A frame is a note only if periodic enough                                                      | `CLARITY_THRESHOLD`              | 0.85                |
| …and loud enough (about −40 dBFS)                                                              | `MIN_RMS`                        | 0.01                |
| The same semitone must hold before it counts (attack transients are ignored)                   | `STABLE_MS`                      | 50 ms               |
| A sounding note counts once; it counts again after silence lasting                             | `RELEASE_MS`                     | 80 ms               |
| …or after a new attack: loudness rising by this factor within the window                       | `ONSET_RATIO`, `ONSET_WINDOW_MS` | × 1.8 within 120 ms |
| …but never sooner than this after the previous note                                            | `REARM_AFTER_MS`                 | 150 ms              |
| A different note counts as soon as it is stable, even if the previous one is still sounding    | —                                | —                   |
| Notes are compared by pitch class with hysteresis, so out-of-tune notes and vibrato are stable | `HYSTERESIS`                     | 0.2 semitones       |

The answer's time is the frame's timestamp, so the average response time includes about
100 ms of detection latency.

## Limits

- Monophonic only. Notes left ringing (sustain pedal, open strings) can confuse detection when
  they are as loud as the new note.
- Analysis pauses when the tab is in the background.
- Digital pianos with USB-MIDI will get exact, latency-free input with the MIDI item of the
  roadmap (Chrome, Edge, Android; not Safari/iOS).

## Tests

- Unit: pitch detection over the whole range with synthetic sine, sawtooth, piano-like (weak
  fundamental, inharmonic partials) and plucked-string signals at 44.1 and 48 kHz, plus noise;
  note tracker scenarios (sustained, repeated, legato, glitches, octave jumps, vibrato,
  crescendo); the source loop with a fake microphone and scheduler; error mapping; the panel.
- End-to-end (`e2e/microphone.spec.ts`, Playwright project `microphone`): Chromium's fake
  microphone plays a generated piano-like A4 (`e2e/fakeMicrophone.ts`); the app must hear "La"
  and record an answer, and ask for a tap after a reload.
