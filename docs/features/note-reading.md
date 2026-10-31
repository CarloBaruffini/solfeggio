# Note reading ("Lettura delle note")

The user sees a short row of random notes on a staff and plays them, left to right,
on a 12-key piano (on screen or with the computer keyboard).

Code: `src/core/exercises/noteReading/` (rules), `src/features/noteReading/` (screen).

## Settings

| Setting        | UI label          | Values                                                 | Default   | Starts a new round? |
| -------------- | ----------------- | ------------------------------------------------------ | --------- | ------------------- |
| `clef`         | Chiave            | `treble` (Violino), `bass` (Basso), `alto` (Contralto) | `treble`  | Yes                 |
| `ledgerLines`  | Tagli addizionali | `0` (Nessuno), `1`, `2`                                | `1`       | Yes                 |
| `accidentals`  | Alterazioni ♯ ♭   | on / off                                               | off       | Yes                 |
| `naming`       | Nomi              | `solfege` (Do Re Mi), `letter` (C D E)                 | `solfege` | No                  |
| `showKeyNames` | Nomi sui tasti    | on / off                                               | on        | No                  |
| `sound`        | Suono             | on / off                                               | on        | No                  |

Settings are persisted in `localStorage` (`solfeggio:settings`).

## Note generation

Pitches are positions on the staff, counted as a **diatonic index**
`d = octave × 7 + letter` (letter: C = 0 … B = 6; octave in scientific pitch notation, C4 = middle C).

Each clef is defined by the diatonic index `b` of its **bottom line**:

| Clef   | Bottom line | `b` |
| ------ | ----------- | --- |
| Treble | E4          | 30  |
| Bass   | G2          | 18  |
| Alto   | F3          | 24  |

With `L` ledger lines allowed, notes are drawn uniformly from `[b − 1 − 2L, b + 9 + 2L]`:
the staff itself spans `b … b + 8`, plus the space just outside it, plus two positions
(line and space) per ledger line.

| Clef   | 0 ledger lines | 1 ledger line | 2 ledger lines |
| ------ | -------------- | ------------- | -------------- |
| Treble | D4 – G5        | B3 – B5       | G3 – D6        |
| Bass   | F2 – B3        | D2 – D4       | B1 – F4        |
| Alto   | E3 – A4        | C3 – C5       | A2 – E5        |

Accidentals (when enabled): each note has a 40 % chance of getting one; sharp or flat is
picked uniformly among those allowed. E♯, B♯, C♭ and F♭ are never generated, so every
written note maps to exactly one key with its usual name.

The same note (same position and accidental) never appears twice in a row.

Notes per round depend on the staff width: 8 from 640 px, 6 from 440 px, otherwise 5.
The first round, generated before the staff is laid out, uses the viewport width instead.

## Answering

- Notes are answered in order; the **current** note is blue and highlighted by a band.
- Answers are compared by **pitch class** (the piano has a single octave).
- **Correct:** the note turns green (or red if it had mistakes) and the next one becomes current.
- **Wrong:** the note is marked as missed and stays current; the feedback line names the key played.
- **Hint:** after 2 wrong attempts on the same note, the correct key pulses and the feedback names the note.
- **Round complete:** the feedback shows "Fatto! X su N al primo colpo"; input is ignored for
  1.1 s, then a new round starts.
- Every key press plays the key's pitch class **in the octave of the current note**, so the
  right answer sounds as written. With no current note, octave 4 is used.

## Statistics

| Stat         | UI label     | Definition                                                                                                               |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Correct      | Corrette     | Number of correct key presses                                                                                            |
| Wrong        | Errori       | Number of wrong key presses                                                                                              |
| Accuracy     | Precisione   | correct ÷ (correct + wrong), rounded to an integer %; "—" before the first press                                         |
| Streak       | Serie        | Consecutive notes answered right at the first attempt; a wrong press resets it                                           |
| Best streak  | Record serie | Highest streak ever; persisted (`solfeggio:records`)                                                                     |
| Average time | Tempo medio  | Mean time from a note becoming current to its correct answer, in seconds with one decimal, Italian format (e.g. `2,4 s`) |

"Nuove note" starts a new round; "Azzera statistiche" resets the statistics and the best streak.

## Keyboard shortcuts

Physical keys (layout-independent `KeyboardEvent.code`), like a DAW's typing keyboard:

| Key  | A   | W   | S   | E   | D   | F   | T   | G   | Y   | H   | U   | J   |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Note | C   | C♯  | D   | D♯  | E   | F   | F♯  | G   | G♯  | A   | A♯  | B   |

Ignored when a modifier (Cmd/Ctrl/Alt) is held, on auto-repeat, or while typing in a form field.
The hints on the keys are hidden on touch devices.

## Display rules

- The staff is drawn on a light "paper" card in both light and dark theme.
- Note colours: pending = ink, current = blue, done = green, done with mistakes = red.
- Black-key labels show both names (e.g. Do♯ / Re♭).
