export interface Card {
    id: number;
    note_id: number;
    deck_id: number;
    template_ordinal: number;
    type: number; // 0=new,1=learning,2=review,3=relearning
    queue: number; // -1=suspended,0=new,1=learning,2=review
    due: number;
    interval_days: number;
    ease_factor: number; // permille (2500 = 2.5)
    reps: number;
    lapses: number;
    flags: number;
    created_at: number;
    modified_at: number;
}
