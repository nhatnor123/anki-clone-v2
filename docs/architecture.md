# Flashcard Learning App — Architecture

> **Platform:** iOS — Expo SDK 54 + React Native
> **Requirements:** See [requirement.md](./requirement.md)
> **Plan:** See [plan.md](./plan.md)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │ DeckList  │ │  Study   │ │Browser │ │  Statistics   │  │
│  │  Screen   │ │  Screen  │ │ Screen │ │   Screen     │  │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    State Management                      │
│             Zustand Stores (per feature)                  │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                          │
│  ┌───────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
│  │  Import    │ │ Scheduler│ │ Media  │ │  Template    │  │
│  │  Service   │ │ (FSRS)   │ │Service │ │  Renderer    │  │
│  └───────────┘ └──────────┘ └────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────┤
│                  Data Access Layer                        │
│  ┌───────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
│  │   Deck     │ │  Card    │ │  Note  │ │   Review     │  │
│  │   Repo     │ │  Repo    │ │  Repo  │ │    Repo      │  │
│  └───────────┘ └──────────┘ └────────┘ └─────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    Storage Layer                          │
│     ┌──────────────┐            ┌───────────────────┐    │
│     │  expo-sqlite  │            │  expo-file-system  │    │
│     │  (SQLite DB)  │            │  (Media Files)     │    │
│     └──────────────┘            └───────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Expo SDK 54 + React Native | iOS app framework |
| **Navigation** | Expo Router | File-based routing (tabs + stacks) |
| **State** | Zustand | Lightweight global state |
| **Database** | expo-sqlite | Local SQLite for all data persistence |
| **SRS Engine** | ts-fsrs | FSRS spaced repetition algorithm |
| **File I/O** | expo-file-system, expo-document-picker | Import `.apkg`, manage media |
| **Zip** | JSZip or react-native-zip-archive | Unpack `.apkg` files |
| **Media** | expo-av, expo-image-picker | Audio playback, image display |
| **Card Render** | React Native WebView | Render HTML/CSS card templates |
| **Charts** | Victory Native or react-native-chart-kit | Statistics graphs |
| **Notifications** | expo-notifications | Study reminders |
| **Settings** | @react-native-async-storage/async-storage | Key-value preferences |

---

## 3. Project Structure

```
anki-clone-v2/
├── app/                          # Expo Router - screens & navigation
│   ├── (tabs)/                   # Tab navigator
│   │   ├── index.tsx             # Deck List (home)
│   │   ├── browser.tsx           # Card Browser
│   │   ├── stats.tsx             # Statistics
│   │   └── settings.tsx          # Settings
│   ├── study/
│   │   └── [deckId].tsx          # Study screen (dynamic route)
│   ├── deck/
│   │   └── [deckId].tsx          # Deck overview
│   ├── note/
│   │   ├── add.tsx               # Add note
│   │   └── [noteId].tsx          # Edit note
│   ├── import.tsx                # Import .apkg screen
│   └── _layout.tsx               # Root layout
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Button, Card, Loading, EmptyState
│   │   ├── deck/                 # DeckListItem, DeckCountBadge
│   │   ├── study/                # CardView, AnswerButtons, CardCounter
│   │   └── stats/                # Chart components
│   │
│   ├── services/                 # Business logic
│   │   ├── database/
│   │   │   ├── DatabaseService.ts       # DB init, migrations, connection
│   │   │   ├── repositories/
│   │   │   │   ├── DeckRepository.ts
│   │   │   │   ├── CardRepository.ts
│   │   │   │   ├── NoteRepository.ts
│   │   │   │   ├── NoteTypeRepository.ts
│   │   │   │   └── ReviewRepository.ts
│   │   │   └── migrations/
│   │   │       └── 001_initial_schema.ts
│   │   │
│   │   ├── import/
│   │   │   ├── ApkgImportService.ts     # Orchestrates full import flow
│   │   │   ├── AnkiDatabaseParser.ts    # Reads Anki's .anki2 SQLite DB
│   │   │   └── MediaExtractor.ts        # Extracts & maps media files
│   │   │
│   │   ├── scheduler/
│   │   │   ├── SchedulerService.ts      # Wraps ts-fsrs for the app
│   │   │   └── CardQueueBuilder.ts      # Builds study queue (new, learning, review)
│   │   │
│   │   ├── template/
│   │   │   └── TemplateRenderer.ts      # {{field}} substitution + HTML generation
│   │   │
│   │   └── media/
│   │       └── MediaService.ts          # File path resolution, cleanup
│   │
│   ├── stores/                   # Zustand state stores
│   │   ├── useDeckStore.ts       # Deck list state
│   │   ├── useStudyStore.ts      # Active study session state
│   │   ├── useImportStore.ts     # Import progress state
│   │   └── useSettingsStore.ts   # App settings
│   │
│   ├── models/                   # TypeScript types & interfaces
│   │   ├── Deck.ts
│   │   ├── Card.ts
│   │   ├── Note.ts
│   │   ├── NoteType.ts
│   │   ├── CardTemplate.ts
│   │   ├── ReviewLog.ts
│   │   └── StudySession.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDatabase.ts
│   │   ├── useStudySession.ts
│   │   ├── useImport.ts
│   │   └── useDeckStats.ts
│   │
│   ├── constants/                # App constants
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── defaults.ts           # Default SRS parameters
│   │
│   └── utils/                    # Utility functions
│       ├── dateUtils.ts
│       ├── ankiFieldParser.ts    # Parse Anki's 0x1f-separated fields
│       └── formatters.ts         # Interval formatting ("1d", "10m")
│
├── assets/                       # Static assets (icons, fonts)
├── docs/                         # Project documentation
│   ├── requirement.md
│   ├── plan.md
│   └── architecture.md
│
├── app.json                      # Expo config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Data Model

### 4.1 Database Schema (SQLite)

```sql
-- App collection metadata
CREATE TABLE collection (
    id          INTEGER PRIMARY KEY,
    created_at  INTEGER NOT NULL,  -- epoch seconds
    modified_at INTEGER NOT NULL,
    settings    TEXT NOT NULL DEFAULT '{}'  -- JSON
);

-- Decks
CREATE TABLE decks (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    parent_id   INTEGER REFERENCES decks(id),
    options     TEXT NOT NULL DEFAULT '{}',  -- JSON: new_per_day, max_reviews, steps etc.
    created_at  INTEGER NOT NULL,
    modified_at INTEGER NOT NULL
);

-- Note Types (Models)
CREATE TABLE note_types (
    id               INTEGER PRIMARY KEY,
    name             TEXT NOT NULL,
    css              TEXT DEFAULT '',
    type             INTEGER NOT NULL DEFAULT 0,  -- 0=standard, 1=cloze
    sort_field_index INTEGER NOT NULL DEFAULT 0,
    created_at       INTEGER NOT NULL
);

-- Field definitions for each note type
CREATE TABLE field_defs (
    id           INTEGER PRIMARY KEY,
    note_type_id INTEGER NOT NULL REFERENCES note_types(id),
    name         TEXT NOT NULL,
    ordinal      INTEGER NOT NULL,
    font         TEXT DEFAULT 'Arial',
    font_size    INTEGER DEFAULT 20
);

-- Card templates for each note type
CREATE TABLE card_templates (
    id              INTEGER PRIMARY KEY,
    note_type_id    INTEGER NOT NULL REFERENCES note_types(id),
    name            TEXT NOT NULL,
    ordinal         INTEGER NOT NULL,
    question_format TEXT NOT NULL,  -- HTML with {{FieldName}}
    answer_format   TEXT NOT NULL   -- HTML with {{FieldName}} and {{FrontSide}}
);

-- Notes (raw content)
CREATE TABLE notes (
    id           INTEGER PRIMARY KEY,
    note_type_id INTEGER NOT NULL REFERENCES note_types(id),
    guid         TEXT NOT NULL,
    fields       TEXT NOT NULL,  -- 0x1f-separated field values
    tags         TEXT DEFAULT '',
    checksum     INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    modified_at  INTEGER NOT NULL
);

-- Cards (reviewable items)
CREATE TABLE cards (
    id               INTEGER PRIMARY KEY,
    note_id          INTEGER NOT NULL REFERENCES notes(id),
    deck_id          INTEGER NOT NULL REFERENCES decks(id),
    template_ordinal INTEGER NOT NULL DEFAULT 0,
    type             INTEGER NOT NULL DEFAULT 0,  -- 0=new,1=learning,2=review,3=relearning
    queue            INTEGER NOT NULL DEFAULT 0,  -- -1=suspended,0=new,1=learning,2=review
    due              INTEGER NOT NULL DEFAULT 0,
    interval_days    INTEGER NOT NULL DEFAULT 0,
    ease_factor      INTEGER NOT NULL DEFAULT 2500,  -- permille (2500 = 2.5)
    reps             INTEGER NOT NULL DEFAULT 0,
    lapses           INTEGER NOT NULL DEFAULT 0,
    flags            INTEGER NOT NULL DEFAULT 0,
    created_at       INTEGER NOT NULL,
    modified_at      INTEGER NOT NULL
);

-- Review history
CREATE TABLE review_log (
    id            INTEGER PRIMARY KEY,
    card_id       INTEGER NOT NULL REFERENCES cards(id),
    ease          INTEGER NOT NULL,  -- 1=again,2=hard,3=good,4=easy
    interval      INTEGER NOT NULL,
    last_interval INTEGER NOT NULL,
    ease_factor   INTEGER NOT NULL,
    time_taken_ms INTEGER NOT NULL,
    type          INTEGER NOT NULL,  -- 0=learn,1=review,2=relearn
    reviewed_at   INTEGER NOT NULL   -- epoch milliseconds
);

-- Indexes
CREATE INDEX idx_cards_deck_queue_due ON cards(deck_id, queue, due);
CREATE INDEX idx_cards_note ON cards(note_id);
CREATE INDEX idx_notes_type ON notes(note_type_id);
CREATE INDEX idx_review_log_card ON review_log(card_id);
CREATE INDEX idx_field_defs_type ON field_defs(note_type_id);
CREATE INDEX idx_card_templates_type ON card_templates(note_type_id);
```

### 4.2 Entity Relationship

```
┌──────────┐     ┌──────────────┐     ┌───────────────┐
│note_types│────<│  field_defs   │     │card_templates │
│          │────<│              │     │               │
└──────────┘     └──────────────┘     └───────────────┘
      │
      │ 1:N
      ▼
┌──────────┐     ┌──────────────┐     ┌───────────────┐
│  notes   │────<│    cards      │────<│  review_log   │
└──────────┘     └──────────────┘     └───────────────┘
                        │
                        │ N:1
                        ▼
                 ┌──────────────┐
                 │    decks     │
                 │  (self-ref)  │
                 └──────────────┘
```

---

## 5. Key Data Flows

### 5.1 APKG Import Flow

```
User taps "Import"
    │
    ▼
expo-document-picker → select .apkg file
    │
    ▼
Copy to app temp directory
    │
    ▼
Unzip (.apkg is a ZIP)
    ├── collection.anki2  (SQLite DB)
    └── media/            (numbered files + media JSON map)
    │
    ▼
AnkiDatabaseParser
    ├── Read `col` table → extract models JSON, decks JSON, dconf JSON
    ├── Read `notes` table → map to app notes
    └── Read `cards` table → map to app cards
    │
    ▼
MediaExtractor
    ├── Parse media JSON (maps "0" → "image.jpg", "1" → "audio.mp3")
    └── Copy files to app's persistent media directory
    │
    ▼
DatabaseService
    ├── Insert note_types, field_defs, card_templates
    ├── Insert notes
    ├── Insert cards (all start as type=new, queue=new)
    └── Insert decks
    │
    ▼
Navigate to Deck List (shows imported decks)
```

### 5.2 Study Session Flow

```
User taps deck → Study
    │
    ▼
CardQueueBuilder
    ├── Query new cards (queue=0, up to daily limit)
    ├── Query learning cards (queue=1, due <= now)
    └── Query review cards (queue=2, due <= today)
    │
    ▼
Study Screen shows first card
    │
    ▼
TemplateRenderer
    ├── Get note fields for card
    ├── Get card template (question_format / answer_format)
    ├── Replace {{FieldName}} with actual values
    ├── Replace media refs (e.g. <img src="file.jpg">) with local paths
    └── Wrap in HTML with note type CSS
    │
    ▼
WebView renders card front (question)
    │
    ▼
User taps "Show Answer"
    │
    ▼
WebView renders card back (answer)
    │
    ▼
User taps rating button (Again/Hard/Good/Easy)
    │
    ▼
SchedulerService (ts-fsrs)
    ├── Compute new state (type, queue)
    ├── Compute new due date
    ├── Compute new interval
    └── Compute new ease factor
    │
    ▼
CardRepository.update(card)
ReviewRepository.insert(reviewLog)
    │
    ▼
Next card (or Congratulations if done)
```

### 5.3 Local Persistence Model

```
App Launch
    │
    ▼
DatabaseService.initialize()
    ├── Open/create SQLite DB at persistent path
    ├── Run pending migrations
    └── Return DB connection
    │
    ▼
All imported data + review progress lives in SQLite
    │
    ▼
On review → immediately write to cards + review_log tables
    │
    ▼
App close → no special action needed (SQLite auto-persists)
    │
    ▼
App reopen → data intact, resume where left off
```

---

## 6. Card Template Rendering

Cards are rendered using a **WebView** with HTML/CSS:

```
┌─ WebView ─────────────────────────────────┐
│                                           │
│  <html>                                   │
│    <head>                                 │
│      <style>{noteType.css}</style>        │
│    </head>                                │
│    <body>                                 │
│      {rendered template HTML}             │
│      <!-- {{Front}} → actual value -->    │
│      <!-- <img src="..."> → local file -->│
│      <!-- [sound:x.mp3] → audio player -->│
│    </body>                                │
│  </html>                                  │
│                                           │
└───────────────────────────────────────────┘
```

**Template substitution:**
- `{{FieldName}}` → replaced with note field value
- `{{FrontSide}}` → on answer template, replaced with rendered question
- `{{cloze:FieldName}}` → cloze deletion rendering
- `<img src="filename.jpg">` → resolved to local `file://` URI
- `[sound:filename.mp3]` → converted to audio player / auto-played

---

## 7. State Management (Zustand)

| Store | Responsibility |
|---|---|
| `useDeckStore` | Deck list, counts, selected deck, CRUD operations |
| `useStudyStore` | Current study session: card queue, current card, answer state |
| `useImportStore` | Import progress: status, percentage, error messages |
| `useSettingsStore` | App preferences: new day hour, review options |

**Pattern:** Stores call repository methods for data access, then update UI state.

```
Screen → Store action → Repository → SQLite
                ↓
         Update Zustand state
                ↓
         React re-render
```

---

## 8. FSRS Integration

```typescript
// Simplified usage of ts-fsrs
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs';

const f = fsrs();  // default parameters

// For a new card:
const card = createEmptyCard();
const result = f.repeat(card, new Date());

// result contains scheduling for each rating:
// result[Rating.Again]  → { card: updatedCard, log: reviewLog }
// result[Rating.Hard]   → { card: updatedCard, log: reviewLog }
// result[Rating.Good]   → { card: updatedCard, log: reviewLog }
// result[Rating.Easy]   → { card: updatedCard, log: reviewLog }

// Show intervals on buttons:
// result[Rating.Again].card.scheduled_days → "1m"
// result[Rating.Good].card.scheduled_days  → "10m"
```

The `SchedulerService` wraps `ts-fsrs` and maps between:
- App's card model ↔ `ts-fsrs` Card type
- App's review_log model ↔ `ts-fsrs` ReviewLog type
