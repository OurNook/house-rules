import { storage } from '@/utils/storage';
import type { Player } from '@/types/player';

const KEY = 'diminishing-whist-players';

export const diminishingWhistPlayers = {
  getAll(): Player[] {
    return storage.get<Player[]>(KEY, []);
  },

  add(name: string): Player {
    const player: Player = { id: Date.now().toString(), name: name.trim() };
    storage.set(KEY, [...diminishingWhistPlayers.getAll(), player]);
    return player;
  },

  update(id: string, name: string): void {
    storage.set(
      KEY,
      diminishingWhistPlayers.getAll().map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );
  },

  remove(id: string): void {
    storage.set(KEY, diminishingWhistPlayers.getAll().filter((p) => p.id !== id));
  },

  recordWin(id: string): void {
    storage.set(
      KEY,
      diminishingWhistPlayers.getAll().map((p) => (p.id === id ? { ...p, wins: (p.wins ?? 0) + 1 } : p))
    );
  },

  recordWinByName(name: string): void {
    const player = diminishingWhistPlayers.getAll().find(p => p.name === name);
    if (player) diminishingWhistPlayers.recordWin(player.id);
  },
};
