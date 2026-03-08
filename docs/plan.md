# Flashcard Learning App — Implementation Plan

> **Platform:** iOS — Expo SDK 54 + React Native
> **Architecture:** See [architecture.md](./architecture.md)
> **Requirements:** See [requirement.md](./requirement.md)

---

## Phase 1 — MVP: Import & Study

> **Goal:** Import `.apkg` files, study flashcards with FSRS, persist progress locally.
> **Estimated Duration:** 4–6 weeks

### 1.1 Project Setup

| Task | Details |
|---|---|
| Initialize Expo project | Expo SDK 54, TypeScript, Expo Router |
| Install core dependencies | `expo-sqlite`, `ts-fsrs`, `expo-file-system`, `expo-document-picker`, `expo-av`, `zustand` |
| Configure project structure | Feature-based folder layout (see architecture.md) |
| Set up linting & formatting | ESLint + Prettier |

### 1.2 Database Layer

| Task | Details |
|---|---|
| Design app SQLite schema | Tables: `decks`, `note_types`, `field_defs`, `card_templates`, `notes`, `cards`, `review_log` |
| Create database service | `DatabaseService` — init, migrations, CRUD operations |
| Write repository classes | `DeckRepository`, `CardRepository`, `NoteRepository`, `ReviewRepository` |
| Write migration scripts | Create all tables on first launch, handle schema versions |

### 1.3 APKG Import Engine

| Task | Details |
|---|---|
| File picker integration | `expo-document-picker` to select `.apkg` files |
| Unzip `.apkg` | Extract ZIP to temp directory (`.apkg` = renamed `.zip`) |
| Parse Anki SQLite DB | Read `collection.anki2` → extract `col`, `notes`, `cards` tables |
| Parse models/decks JSON | Extract note types (models), decks, deck configs from `col.models`, `col.decks`, `col.dconf` |
| Extract media files | Parse `media` JSON mapping → copy numbered files to app media directory with original names |
| Map to app schema | Transform Anki schema → app schema, preserving IDs for card/note relationships |
| Handle re-import | Detect duplicate decks by name/ID, offer merge or replace |
| Progress indicator | Show import progress (parsing, extracting media, saving) |

### 1.4 Deck List Screen (Home)

| Task | Details |
|---|---|
| UI layout | List of decks with name + card counts (new/learning/review) |
| Card count queries | SQL queries to compute due counts per deck per day |
| Import button | FAB or header button → triggers file picker → import flow |
| Tap to study | Navigate to study screen for selected deck |
| Empty state | Show onboarding / import prompt when no decks exist |

### 1.5 Study Screen

| Task | Details |
|---|---|
| Card queue builder | Select due cards: new (up to daily limit), learning, review |
| Card rendering | WebView-based rendering of card templates with `{{field}}` substitution |
| Show question | Display card front, tap to reveal answer |
| Show answer | Display card back + answer buttons (Again/Hard/Good/Easy) |
| FSRS integration | Use `ts-fsrs` to compute next interval/state for each response |
| Update card state | Persist new `due`, `interval`, `ease`, `type`, `queue`, `reps`, `lapses` |
| Write review log | Insert `review_log` entry for every review action |
| Card counters | Real-time new/learning/review remaining counts |
| Next interval display | Show computed intervals on answer buttons |
| Congratulations | Show when session complete (all due cards reviewed) |
| Media display | Load images from local media directory, play audio via `expo-av` |

### 1.6 Light Theme & Styling

| Task | Details |
|---|---|
| Design system | Color palette, typography, spacing tokens |
| Common components | Button, Card, Header, Loading, EmptyState |
| Light theme | Single light theme applied globally |

---

## Phase 2 — Card Management & Browser

> **Goal:** Create, edit, browse, and manage cards.
> **Estimated Duration:** 3–4 weeks

| Task | Details |
|---|---|
| Add Note screen | Form for creating notes (select note type, fill fields, pick deck) |
| Edit Note screen | Edit existing note from review or browser |
| Card Browser | Searchable/filterable list of all cards |
| Search engine | Full-text search across card content, tag filter, state filter |
| Deck CRUD | Create, rename, delete decks from deck list |
| Undo system | Undo last review action (store previous card state) |
| Tags | Add/remove tags on notes, filter by tag |
| Suspend/Bury | Toggle card suspension from browser or review |
| Additional note types | Basic (reversed), Cloze deletion support |

---

## Phase 3 — Statistics & Settings

> **Goal:** Learning analytics and app customization.
> **Estimated Duration:** 2–3 weeks

| Task | Details |
|---|---|
| Today's stats | Cards studied, time, accuracy — computed from `review_log` |
| Review history chart | Bar chart of reviews per day (last 30 days) |
| Forecast chart | Predicted reviews per day (next 30 days) |
| Card state distribution | Pie chart: new/learning/review/suspended |
| Streak counter | Compute from `review_log` dates |
| Retention rate | % of reviews answered Good/Easy |
| Settings screen | General, review preferences, notifications |
| Study reminders | `expo-notifications` for daily reminder at user-chosen time |
| Per-deck options | Configure new cards/day, max reviews, learning steps |

---

## Phase 4 — Rich Content & Advanced

> **Goal:** Full media support and advanced features.
> **Estimated Duration:** 3–4 weeks

| Task | Details |
|---|---|
| Rich text toolbar | Bold, italic, underline for note editor |
| TTS integration | `expo-speech` for reading card content |
| Image capture | `expo-image-picker` for camera + library |
| Audio recording | `expo-av` for recording audio clips |
| Export `.apkg` | Build `.apkg` from app data for Anki Desktop |
| Import CSV | Parse CSV → create notes |
| MathJax | WebView-based MathJax rendering |
| Whiteboard | Drawing overlay during review |
| Custom fonts | Load and apply custom fonts |
| Type-answer | Text input + comparison during review |
| Filtered decks | Custom study sessions from search criteria |

---

## Key Technical Risks

| Risk | Mitigation |
|---|---|
| `.apkg` format variations | Test with many real `.apkg` files from AnkiWeb shared decks |
| Large deck performance | Indexed queries, lazy loading, pagination in browser |
| Card template rendering | WebView rendering may need optimization for complex HTML/CSS |
| FSRS accuracy | Validate against Anki Desktop scheduling for same card sequences |
| Media storage | Efficient file management, cleanup orphaned media on deck delete |
