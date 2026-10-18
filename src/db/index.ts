import Dexie, { type Table } from 'dexie';
import type { Board } from '../types';
import { STARTER_TEMPLATES } from './templates';


export class TierCraftDB extends Dexie {
  boards!: Table<Board, string>;

  constructor() {
    super('TierCraftDB');
    this.version(1).stores({
      boards: 'id, title, updatedAt',
    });
  }
}

export const db = new TierCraftDB();

export async function initializeDatabase(): Promise<Board> {
  const count = await db.boards.count();
  if (count === 0) {
    // Seed initial templates
    await db.boards.bulkAdd(STARTER_TEMPLATES);
    return STARTER_TEMPLATES[0];
  }

  const latest = await db.boards.orderBy('updatedAt').reverse().first();
  return latest || STARTER_TEMPLATES[0];
}
