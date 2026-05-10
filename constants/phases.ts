export type PhaseSegment =
  | { type: 'set'; letter: string; count: number }
  | { type: 'run'; count: number }
  | { type: 'color'; count: number };

export const PHASE_SEGMENTS: Record<number, PhaseSegment[]> = {
  1:  [{ type: 'set', letter: 'A', count: 3 }, { type: 'set', letter: 'B', count: 3 }],
  2:  [{ type: 'set', letter: 'A', count: 3 }, { type: 'run', count: 4 }],
  3:  [{ type: 'set', letter: 'A', count: 4 }, { type: 'run', count: 4 }],
  4:  [{ type: 'run', count: 7 }],
  5:  [{ type: 'run', count: 8 }],
  6:  [{ type: 'run', count: 9 }],
  7:  [{ type: 'set', letter: 'A', count: 4 }, { type: 'set', letter: 'B', count: 4 }],
  8:  [{ type: 'color', count: 7 }],
  9:  [{ type: 'set', letter: 'A', count: 5 }, { type: 'set', letter: 'B', count: 2 }],
  10: [{ type: 'set', letter: 'A', count: 5 }, { type: 'set', letter: 'B', count: 3 }],
};

const RUN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export function getSegmentTiles(seg: PhaseSegment): string[] {
  if (seg.type === 'set') return Array(seg.count).fill(seg.letter);
  if (seg.type === 'run') return RUN_LETTERS.slice(0, seg.count);
  return Array(seg.count).fill('');
}
