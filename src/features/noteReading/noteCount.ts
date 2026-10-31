/** Notes per round for a staff of the given width (see docs/features/note-reading.md). */
export function notesPerRound(staffWidth: number): number {
  if (staffWidth >= 640) return 8;
  if (staffWidth >= 440) return 6;
  return 5;
}
