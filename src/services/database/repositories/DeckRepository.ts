import { dbService } from '../DatabaseService';
import { Deck } from '@/models/Deck';

export class DeckRepository {
  static async getAll(): Promise<Deck[]> {
    return dbService.query<Deck>('SELECT * FROM decks ORDER BY name ASC');
  }

  static async getById(id: number): Promise<Deck | null> {
    return dbService.queryFirst<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
  }

  static async insert(deck: Partial<Deck>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO decks (id, name, description, parent_id, options, created_at, modified_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deck.id || null, // Allow keeping Anki IDs
        deck.name,
        deck.description || '',
        deck.parent_id || null,
        deck.options || '{}',
        deck.created_at || Date.now(),
        deck.modified_at || Date.now()
      ]
    );
    return result.lastInsertRowId;
  }

  static async update(id: number, updates: Partial<Deck>): Promise<void> {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      return;
    }

    // Auto-update modified_at if not explicitly provided
    if (!updates.modified_at) {
      updates.modified_at = Date.now();
      keys.push('modified_at');
    }

    const setString = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => (updates as any)[k]);
    values.push(id);

    await dbService.execute(`UPDATE decks SET ${setString} WHERE id = ?`, values);
  }

  static async delete(id: number): Promise<void> {
    await dbService.execute('DELETE FROM decks WHERE id = ?', [id]);
  }

  /**
   * Get learning counts using epochs (using start of day logic on UI side later)
   */
  static async getCountsForDeck(deckId: number, todayEpochDay: number): Promise<{ newCount: number, learningCount: number, reviewCount: number }> {
    const row = await dbService.queryFirst<{ newCount: number, learningCount: number, reviewCount: number }>(
      `SELECT 
        SUM(CASE WHEN queue = 0 THEN 1 ELSE 0 END) as newCount,
        SUM(CASE WHEN queue = 1 THEN 1 ELSE 0 END) as learningCount,
        SUM(CASE WHEN queue = 2 AND due <= ? THEN 1 ELSE 0 END) as reviewCount
       FROM cards WHERE deck_id = ?`,
      [todayEpochDay, deckId]
    );

    return {
      newCount: row?.newCount || 0,
      learningCount: row?.learningCount || 0,
      reviewCount: row?.reviewCount || 0
    };
  }
}
