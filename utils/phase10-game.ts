import { storage } from '@/utils/storage';
import type { GamePlayer, Phase10Game } from '@/types/game';

const KEY = 'phase10-game';

export const phase10Game = {
  get(): Phase10Game | null {
    return storage.get<Phase10Game | null>(KEY, null);
  },

  start(players: Pick<GamePlayer, 'id' | 'name'>[]): Phase10Game {
    const game: Phase10Game = {
      players: players.map(p => ({ ...p, score: 0, phase: 1 })),
      startedAt: new Date().toISOString(),
    };
    storage.set(KEY, game);
    return game;
  },

  updatePlayer(id: string, updates: Partial<Pick<GamePlayer, 'score' | 'phase'>>): void {
    const game = phase10Game.get();
    if (!game) return;
    storage.set(KEY, {
      ...game,
      players: game.players.map(p => p.id === id ? { ...p, ...updates } : p),
    });
  },

  end(): void {
    storage.set(KEY, null);
  },
};
