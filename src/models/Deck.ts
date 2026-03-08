export interface Deck {
    id: number;
    name: string;
    description: string;
    parent_id: number | null;
    options: string; // JSON: new_per_day, max_reviews, steps etc.
    created_at: number;
    modified_at: number;
}
