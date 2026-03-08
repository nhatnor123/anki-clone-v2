import { fsrs, Rating, Card as FSRSCard, createEmptyCard } from 'ts-fsrs';
import { Card } from '@/models/Card';
import { ReviewLog } from '@/models/ReviewLog';

export class SchedulerService {
  private static f = fsrs();

  static scheduleCard(card: Card, rating: Rating, now: Date = new Date()): { updatedCard: Card, log: Partial<ReviewLog> } {
    const fsrsCard = this.mapToFSRS(card);
    const schedulingCards = this.f.repeat(fsrsCard, now);
    const result = (schedulingCards as any)[rating];

    return {
      updatedCard: this.mapFromFSRS(result.card, card.id, card.note_id, card.deck_id, card.template_ordinal),
      log: {
        card_id: card.id,
        ease: rating as number,
        interval: result.card.elapsed_days,
        last_interval: card.interval_days,
        ease_factor: Math.round(result.card.stability * 1000),
        type: card.type,
        reviewed_at: now.getTime()
      }
    };
  }

  static getNextIntervals(card: Card, now: Date = new Date()): Record<Rating, string> {
    const fsrsCard = this.mapToFSRS(card);
    const schedulingCards = this.f.repeat(fsrsCard, now);

    const format = (days: number) => {
      if (days < 1) return '< 1d';
      if (days < 30) return `${Math.round(days)}d`;
      return `${(days / 30).toFixed(1)}mo`;
    };

    return {
      [Rating.Again]: format((schedulingCards as any)[Rating.Again].card.scheduled_days),
      [Rating.Hard]: format((schedulingCards as any)[Rating.Hard].card.scheduled_days),
      [Rating.Good]: format((schedulingCards as any)[Rating.Good].card.scheduled_days),
      [Rating.Easy]: format((schedulingCards as any)[Rating.Easy].card.scheduled_days),
    } as any;
  }

  private static mapToFSRS(card: Card): FSRSCard {
    return {
      ...createEmptyCard(),
      due: new Date(card.due),
      stability: card.ease_factor / 1000,
      difficulty: 5,
      elapsed_days: card.interval_days,
      scheduled_days: card.interval_days,
      reps: card.reps,
      lapses: card.lapses,
      state: card.type as any,
      last_review: new Date(card.modified_at)
    };
  }

  private static mapFromFSRS(fcard: FSRSCard, id: number, noteId: number, deckId: number, template_ordinal: number): Card {
    return {
      id,
      note_id: noteId,
      deck_id: deckId,
      template_ordinal,
      type: fcard.state as number,
      queue: fcard.state === 0 ? 0 : (fcard.state === 1 ? 1 : 2),
      due: fcard.due.getTime(),
      interval_days: fcard.scheduled_days,
      ease_factor: Math.round(fcard.stability * 1000),
      reps: fcard.reps,
      lapses: fcard.lapses,
      flags: 0,
      created_at: Date.now(),
      modified_at: Date.now()
    };
  }
}
