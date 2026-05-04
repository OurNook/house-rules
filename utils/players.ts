import { storage } from '@/utils/storage';
import type { Player } from '@/types/player';

const KEY = 'players';

export const players = {
  getAll(): Player[] {
    return storage.get<Player[]>(KEY, []);
  },

  add(name: string): Player {
    const player: Player = { id: Date.now().toString(), name: name.trim() };
    storage.set(KEY, [...players.getAll(), player]);
    return player;
  },

  update(id: string, name: string): void {
    storage.set(
      KEY,
      players.getAll().map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );
  },

  remove(id: string): void {
    storage.set(KEY, players.getAll().filter((p) => p.id !== id));
  },
};
