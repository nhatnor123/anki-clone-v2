import { create } from 'zustand';
import { Deck } from '@/models/Deck';
import { DeckRepository } from '../services/database/repositories/DeckRepository';

interface DeckState {
    decks: Deck[];
    counts: Record<number, { newCount: number; learningCount: number; reviewCount: number }>;
    isLoading: boolean;
    error: string | null;

    loadDecks: () => Promise<void>;
    refreshCounts: () => Promise<void>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
    decks: [],
    counts: {},
    isLoading: false,
    error: null,

    loadDecks: async () => {
        set({ isLoading: true, error: null });
        try {
            const decks = await DeckRepository.getAll();
            set({ decks, isLoading: false });
            await get().refreshCounts();
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    refreshCounts: async () => {
        const { decks } = get();
        const todayEpochDay = Math.floor(Date.now() / 86400000);
        const newCounts: Record<number, { newCount: number; learningCount: number; reviewCount: number }> = {};

        for (const deck of decks) {
            const count = await DeckRepository.getCountsForDeck(deck.id, todayEpochDay);
            newCounts[deck.id] = count;
        }

        set({ counts: newCounts });
    }
}));
