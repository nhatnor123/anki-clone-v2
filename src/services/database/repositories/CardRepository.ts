import { dbService } from '../DatabaseService';
import { Card } from '@/models/Card';

export class CardRepository {
  static async getById(id: number): Promise<Card | null> {
    return dbService.queryFirst<Card>('SELECT * FROM cards WHERE id = ?', [id]);
  }

  static async insert(card: Partial<Card>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO cards (id, note_id, deck_id, template_ordinal, type, queue, due, interval_days, ease_factor, reps, lapses, flags, created_at, modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.id || null,
        card.note_id,
        card.deck_id,
        card.template_ordinal || 0,
        card.type || 0,
        card.queue !== undefined ? card.queue : 0,
        card.due || 0,
        card.interval_days || 0,
        card.ease_factor || 2500,
        card.reps || 0,
        card.lapses || 0,
        card.flags || 0,
        card.created_at || Date.now(),
        card.modified_at || Date.now()
      ]
    );
    return result.lastInsertRowId;
  }

  static async updateAfterReview(card: Card): Promise<void> {
    await dbService.execute(
      `UPDATE cards SET 
        type = ?, queue = ?, due = ?, interval_days = ?, 
        ease_factor = ?, reps = ?, lapses = ?, modified_at = ?
       WHERE id = ?`,
      [
        card.type,
        card.queue,
        card.due,
        card.interval_days,
        card.ease_factor,
        card.reps,
        card.lapses,
        Date.now(),
        card.id
      ]
    );
  }

  static async getQueueForDeck(deckId: number, limits: { new: number, review: number }, todayEpochDay: number): Promise<Card[]> {
    // Learning cards (all of them should be finished in the session)
    const learning = await dbService.query<Card>(
      'SELECT * FROM cards WHERE deck_id = ? AND queue = 1 ORDER BY due ASC',
      [deckId]
    );

    // Review cards due today (day based)
    const review = await dbService.query<Card>(
      'SELECT * FROM cards WHERE deck_id = ? AND queue = 2 AND due <= ? ORDER BY due ASC LIMIT ?',
      [deckId, todayEpochDay, limits.review]
    );

    // New cards
    const newCards = await dbService.query<Card>(
      'SELECT * FROM cards WHERE deck_id = ? AND queue = 0 ORDER BY due ASC LIMIT ?',
      [deckId, limits.new]
    );

    return [...learning, ...review, ...newCards];
  }

  static async resetDeckProgress(deckId: number): Promise<void> {
    await dbService.execute(
      `UPDATE cards SET 
        type = 0, queue = 0, due = ?, interval_days = 0, 
        ease_factor = 2500, reps = 0, lapses = 0, modified_at = ?
       WHERE deck_id = ?`,
      [Date.now(), Date.now(), deckId]
    );
  }
}
