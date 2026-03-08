import { Card } from './Card';

export interface StudySession {
    deckId: number;
    newCards: Card[];
    learningCards: Card[];
    reviewCards: Card[];
    currentQueue: Card[];
    currentIndex: number;
    stats: {
        newCount: number;
        learningCount: number;
        reviewCount: number;
    };
}
