export type PhaseSegment =
  | { type: 'set'; letter: string; count: number }
  | { type: 'run'; count: number }
  | { type: 'color'; count: number };

export type PhaseRuleset = {
  id: string;
  name: string;
  description: string;
  phases: Record<number, PhaseSegment[]>;
};

const RUN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function getSegmentTiles(seg: PhaseSegment): string[] {
  if (seg.type === 'set') return Array(seg.count).fill(seg.letter);
  if (seg.type === 'run') return RUN_LETTERS.slice(0, seg.count);
  return Array(seg.count).fill('');
}

export const RULESETS: PhaseRuleset[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'The classic Phase 10 phases',
    phases: {
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
    },
  },
  {
    id: 'variant',
    name: 'Variant',
    description: 'Alternative phases for a fresh challenge',
    phases: {
      1:  [{ type: 'run', count: 5 }, { type: 'set', letter: 'A', count: 2 }],
      2:  [{ type: 'set', letter: 'A', count: 3 }, { type: 'run', count: 5 }],
      3:  [{ type: 'set', letter: 'A', count: 4 }, { type: 'run', count: 5 }],
      4:  [{ type: 'run', count: 4 }, { type: 'set', letter: 'A', count: 4 }],
      5:  [{ type: 'set', letter: 'A', count: 4 }, { type: 'set', letter: 'B', count: 4 }],
      6:  [{ type: 'color', count: 8 }],
      7:  [{ type: 'run', count: 9 }],
      8:  [{ type: 'run', count: 8 }],
      9:  [{ type: 'run', count: 7 }],
      10: [{ type: 'set', letter: 'A', count: 5 }, { type: 'set', letter: 'B', count: 5 }],
    },
  },
  {
    id: 'challenge',
    name: 'Challenge',
    description: 'Harder phases for experienced players',
    phases: {
      1:  [{ type: 'set', letter: 'A', count: 4 }, { type: 'set', letter: 'B', count: 4 }],
      2:  [{ type: 'run', count: 7 }],
      3:  [{ type: 'set', letter: 'A', count: 5 }, { type: 'run', count: 5 }],
      4:  [{ type: 'run', count: 8 }],
      5:  [{ type: 'color', count: 8 }],
      6:  [{ type: 'run', count: 9 }],
      7:  [{ type: 'set', letter: 'A', count: 5 }, { type: 'set', letter: 'B', count: 3 }],
      8:  [{ type: 'color', count: 9 }],
      9:  [{ type: 'run', count: 10 }],
      10: [{ type: 'set', letter: 'A', count: 5 }, { type: 'set', letter: 'B', count: 5 }],
    },
  },
];

export const PHASE_SEGMENTS = RULESETS[0].phases;
