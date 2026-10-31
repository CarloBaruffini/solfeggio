// Importing the Bravura entry registers the embedded music font with `document.fonts`.
import 'vexflow/bravura';

let fontsReady: Promise<void> | undefined;

/**
 * Resolves once the Bravura music font is usable. VexFlow 5 draws glyphs as text and
 * measures them with this font, so rendering earlier produces wrong layouts.
 * Always returns the same promise (safe to pass to React's `use`).
 */
export function loadNotationFonts(): Promise<void> {
  fontsReady ??=
    typeof document === 'undefined' || typeof FontFace === 'undefined'
      ? Promise.resolve()
      : document.fonts.load('30px Bravura').then(() => undefined);
  return fontsReady;
}
