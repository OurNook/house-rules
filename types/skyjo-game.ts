export type SkyjoPlayer = {
  id: string;
  name: string;
  score: number;
};

export type SkyjoGame = {
  players: SkyjoPlayer[];
  startedAt: string;
  round: number;
};
