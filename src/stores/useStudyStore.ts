import { create } from 'zustand';
import { Card } from '@/models/Card';
import { Note } from '@/models/Note';
import { NoteTypeWithFieldsAndTemplates } from '@/models/NoteType';
import { CardRepository } from '../services/database/repositories/CardRepository';
import { NoteRepository } from '../services/database/repositories/NoteRepository';
import { NoteTypeRepository } from '../services/database/repositories/NoteTypeRepository';
import { SchedulerService } from '../services/scheduler/SchedulerService';
import { ReviewRepository } from '../services/database/repositories/ReviewRepository';
import { Rating } from 'ts-fsrs';
import { TemplateRenderer } from '../services/template/TemplateRenderer';

interface StudyState {
    deckId: number | null;
    queue: Card[];
    currentIndex: number;
    currentNote: Note | null;
    currentNoteType: NoteTypeWithFieldsAndTemplates | null;
    currentHtml: string;
    currentSounds: string[];
    showAnswer: boolean;
    isComplete: boolean;

    loadQueue: (deckId: number) => Promise<void>;
    nextCard: () => Promise<void>;
    submitRating: (rating: Rating) => Promise<void>;
    toggleAnswer: () => void;
    setShowAnswer: (show: boolean) => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
    deckId: null,
    queue: [],
    currentIndex: 0,
    currentNote: null,
    currentNoteType: null,
    currentHtml: '',
    currentSounds: [],
    showAnswer: false,
    isComplete: false,

    loadQueue: async (deckId: number) => {
        set({ deckId, queue: [], currentIndex: 0, isComplete: false, currentNote: null });
        const todayEpochDay = Math.floor(Date.now() / 86400000);
        // MVP limits: 20 new, 200 review
        const queue = await CardRepository.getQueueForDeck(deckId, { new: 20, review: 200 }, todayEpochDay);

        if (queue.length === 0) {
            set({ isComplete: true });
            return;
        }

        set({ queue });
        await get().nextCard();
    },

    nextCard: async () => {
        const { queue, currentIndex } = get();
        if (currentIndex >= queue.length) {
            set({ isComplete: true });
            return;
        }

        const card = queue[currentIndex];
        const note = await NoteRepository.getById(card.note_id);
        if (!note) throw new Error('Note not found');

        const noteType = await NoteTypeRepository.getWithFieldsAndTemplates(note.note_type_id);
        if (!noteType) throw new Error('NoteType not found');

        const { html, sounds } = await TemplateRenderer.renderQuestion(card, note, noteType);

        set({
            currentNote: note,
            currentNoteType: noteType,
            currentHtml: html,
            currentSounds: sounds,
            showAnswer: false
        });
    },

    toggleAnswer: async () => {
        const { currentNote, currentNoteType, queue, currentIndex, showAnswer, currentHtml } = get();
        if (!currentNote || !currentNoteType || showAnswer) return;

        const card = queue[currentIndex];
        const { html, sounds } = await TemplateRenderer.renderAnswer(card, currentNote, currentNoteType, currentHtml);

        set({
            showAnswer: true,
            currentHtml: html,
            currentSounds: sounds
        });
    },

    submitRating: async (rating: Rating) => {
        const { queue, currentIndex, deckId } = get();
        const card = queue[currentIndex];

        if (!card) return;

        const { updatedCard, log } = SchedulerService.scheduleCard(card, rating);

        await CardRepository.updateAfterReview(updatedCard);
        await ReviewRepository.insert(log);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
            set({ currentIndex: nextIndex, isComplete: true, showAnswer: false });
        } else {
            set({ currentIndex: nextIndex, showAnswer: false });
            await get().nextCard();
        }
    },


    setShowAnswer: (show) => set({ showAnswer: show })
}));
