export interface ReviewLog {
    id: number;
    card_id: number;
    ease: number; // 1=again,2=hard,3=good,4=easy
    interval: number;
    last_interval: number;
    ease_factor: number;
    time_taken_ms: number;
    type: number; // 0=learn,1=review,2=relearn
    reviewed_at: number; // epoch milliseconds
}
