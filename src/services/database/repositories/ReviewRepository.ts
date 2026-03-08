import { dbService } from '../DatabaseService';
import { ReviewLog } from '@/models/ReviewLog';

export class ReviewRepository {
  static async insert(log: Partial<ReviewLog>): Promise<number> {
    const result = await dbService.execute(
      `INSERT INTO review_log (card_id, ease, interval, last_interval, ease_factor, time_taken_ms, type, reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.card_id,
        log.ease,
        log.interval,
        log.last_interval,
        log.ease_factor,
        log.time_taken_ms || 0,
        log.type,
        log.reviewed_at || Date.now()
      ]
    );
    return result.lastInsertRowId;
  }

  static async getForCard(cardId: number): Promise<ReviewLog[]> {
    return dbService.query<ReviewLog>('SELECT * FROM review_log WHERE card_id = ? ORDER BY reviewed_at DESC', [cardId]);
  }

  static async getTodayCount(startOfTodayMs: number): Promise<number> {
    const row = await dbService.queryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM review_log WHERE reviewed_at >= ?',
      [startOfTodayMs]
    );
    return row?.count || 0;
  }
}
