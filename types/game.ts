export type GamePlayer = {
  id: string;
  name: string;
  score: number;
  phase: number;
};

export type Phase10Game = {
  players: GamePlayer[];
  startedAt: string;
  rulesetId: string;
};
