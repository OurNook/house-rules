import { storage } from '@/utils/storage';
import type { SkyjoGame, SkyjoPlayer } from '@/types/skyjo-game';

const KEY = 'skyjo-game';

export const skyjoGame = {
  get(): SkyjoGame | null {
    return storage.get<SkyjoGame | null>(KEY, null);
  },

  start(players: Pick<SkyjoPlayer, 'id' | 'name'>[]): SkyjoGame {
    const game: SkyjoGame = {
      players: players.map(p => ({ ...p, score: 0 })),
      startedAt: new Date().toISOString(),
      round: 1,
    };
    storage.set(KEY, game);
    return game;
  },

  incrementRound(): void {
    const game = skyjoGame.get();
    if (!game) return;
    storage.set(KEY, { ...game, round: game.round + 1 });
  },

  updatePlayer(id: string, score: number): void {
    const game = skyjoGame.get();
    if (!game) return;
    storage.set(KEY, {
      ...game,
      players: game.players.map(p => p.id === id ? { ...p, score } : p),
    });
  },

  end(): void {
    storage.set(KEY, null);
  },
};
