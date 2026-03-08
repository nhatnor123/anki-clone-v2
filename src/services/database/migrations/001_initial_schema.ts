export const initialSchemaMigration = `
-- App collection metadata
CREATE TABLE IF NOT EXISTS collection (
    id          INTEGER PRIMARY KEY,
    created_at  INTEGER NOT NULL,
    modified_at INTEGER NOT NULL,
    settings    TEXT NOT NULL DEFAULT '{}'
);

-- Decks
CREATE TABLE IF NOT EXISTS decks (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    parent_id   INTEGER REFERENCES decks(id),
    options     TEXT NOT NULL DEFAULT '{}',
    created_at  INTEGER NOT NULL,
    modified_at INTEGER NOT NULL
);

-- Note Types (Models)
CREATE TABLE IF NOT EXISTS note_types (
    id               INTEGER PRIMARY KEY,
    name             TEXT NOT NULL,
    css              TEXT DEFAULT '',
    type             INTEGER NOT NULL DEFAULT 0,
    sort_field_index INTEGER NOT NULL DEFAULT 0,
    created_at       INTEGER NOT NULL
);

-- Field definitions for each note type
CREATE TABLE IF NOT EXISTS field_defs (
    id           INTEGER PRIMARY KEY,
    note_type_id INTEGER NOT NULL REFERENCES note_types(id),
    name         TEXT NOT NULL,
    ordinal      INTEGER NOT NULL,
    font         TEXT DEFAULT 'Arial',
    font_size    INTEGER DEFAULT 20
);

-- Card templates for each note type
CREATE TABLE IF NOT EXISTS card_templates (
    id              INTEGER PRIMARY KEY,
    note_type_id    INTEGER NOT NULL REFERENCES note_types(id),
    name            TEXT NOT NULL,
    ordinal         INTEGER NOT NULL,
    question_format TEXT NOT NULL,
    answer_format   TEXT NOT NULL
);

-- Notes (raw content)
CREATE TABLE IF NOT EXISTS notes (
    id           INTEGER PRIMARY KEY,
    note_type_id INTEGER NOT NULL REFERENCES note_types(id),
    guid         TEXT NOT NULL,
    fields       TEXT NOT NULL,
    tags         TEXT DEFAULT '',
    checksum     INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    modified_at  INTEGER NOT NULL
);

-- Cards (reviewable items)
CREATE TABLE IF NOT EXISTS cards (
    id               INTEGER PRIMARY KEY,
    note_id          INTEGER NOT NULL REFERENCES notes(id),
    deck_id          INTEGER NOT NULL REFERENCES decks(id),
    template_ordinal INTEGER NOT NULL DEFAULT 0,
    type             INTEGER NOT NULL DEFAULT 0,
    queue            INTEGER NOT NULL DEFAULT 0,
    due              INTEGER NOT NULL DEFAULT 0,
    interval_days    INTEGER NOT NULL DEFAULT 0,
    ease_factor      INTEGER NOT NULL DEFAULT 2500,
    reps             INTEGER NOT NULL DEFAULT 0,
    lapses           INTEGER NOT NULL DEFAULT 0,
    flags            INTEGER NOT NULL DEFAULT 0,
    created_at       INTEGER NOT NULL,
    modified_at      INTEGER NOT NULL
);

-- Review history
CREATE TABLE IF NOT EXISTS review_log (
    id            INTEGER PRIMARY KEY,
    card_id       INTEGER NOT NULL REFERENCES cards(id),
    ease          INTEGER NOT NULL,
    interval      INTEGER NOT NULL,
    last_interval INTEGER NOT NULL,
    ease_factor   INTEGER NOT NULL,
    time_taken_ms INTEGER NOT NULL,
    type          INTEGER NOT NULL,
    reviewed_at   INTEGER NOT NULL
);

-- Database Schema Version tracking
CREATE TABLE IF NOT EXISTS schema_info (
    version INTEGER PRIMARY KEY
);

-- Initial version
INSERT OR IGNORE INTO schema_info (version) VALUES (1);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_deck_queue_due ON cards(deck_id, queue, due);
CREATE INDEX IF NOT EXISTS idx_cards_note ON cards(note_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(note_type_id);
CREATE INDEX IF NOT EXISTS idx_review_log_card ON review_log(card_id);
CREATE INDEX IF NOT EXISTS idx_field_defs_type ON field_defs(note_type_id);
CREATE INDEX IF NOT EXISTS idx_card_templates_type ON card_templates(note_type_id);
`;
