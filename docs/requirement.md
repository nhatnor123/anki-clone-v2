# Flashcard Learning App — Requirements

> Based on [AnkiDroid](https://github.com/ankidroid/Anki-Android) feature analysis
> **Platform:** iOS — Expo SDK 54 + React Native

> [!IMPORTANT]
> **Primary Use Case:** Import existing `.apkg` files to study flashcards, with all study progress saved locally on-device so learning continues seamlessly across app sessions without re-importing.

---

## 1. Core Concepts

| Concept | Description |
|---|---|
| **Note** | Raw information (e.g. question + answer). Has one or more *fields*. |
| **Card** | A reviewable item generated from a note via a *card template*. One note → multiple cards. |
| **Deck** | Collection of cards, organized by topic. Can be nested (`Japanese::Vocabulary`). |
| **Note Type** | Defines fields and card templates (e.g. "Basic", "Basic & reversed", "Cloze"). |
| **Card Template** | HTML/CSS templates rendering a card's front/back from note fields. |
| **Collection** | Entire user database: decks, notes, cards, review history — stored locally. |

---

## 2. Spaced Repetition — FSRS Algorithm

**Library:** [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (TypeScript, works directly in React Native)

### Card States

| State | Description |
|---|---|
| **New** | Never studied |
| **Learning** | Short intervals (minutes/hours) |
| **Review** | Graduated; longer intervals (days/weeks/months) |
| **Relearning** | Forgotten → re-learning |

### Review Buttons

| Button | Effect |
|---|---|
| **Again** | Forgotten → reset to learning steps |
| **Hard** | Recalled with difficulty |
| **Good** | Recalled acceptably |
| **Easy** | Effortless recall → aggressive interval increase |

### Scheduling Parameters (per-deck)

- New cards/day (default: 20)
- Max reviews/day (default: 200)
- Learning steps (e.g. `1m, 10m`)
- Graduating interval (default: 1 day)
- Easy interval (default: 4 days)
- Relearning steps
- Lapse threshold (leech detection)
- FSRS model weights

---

## 3. Feature Requirements

### 3.1 Deck Management

| ID | Feature | Priority | Description |
|---|---|---|---|
| D-01 | Deck List Screen | **P0** | Home screen with deck counts: new (blue), learning (orange), review (green) |
| D-02 | Create Deck | **P0** | Create new empty decks |
| D-03 | Rename Deck | **P1** | Rename existing decks |
| D-04 | Delete Deck | **P1** | Delete deck and optionally all its cards |
| D-05 | Nested/Sub-decks | **P1** | Hierarchical decks via `::` separator |
| D-06 | Deck Description | **P2** | Markdown description per deck |
| D-07 | Deck Options | **P1** | Per-deck SRS parameters |
| D-08 | Collapse/Expand | **P2** | Collapse parent decks |
| D-09 | Deck Overview | **P1** | Stats before studying: total, new, learning, due |

### 3.2 Card/Note Management

| ID | Feature | Priority | Description |
|---|---|---|---|
| C-01 | Add Note | **P0** | Create notes based on note type |
| C-02 | Edit Note | **P0** | Edit note fields from review screen or browser |
| C-03 | Delete Note | **P1** | Delete note + all associated cards |
| C-04 | Note Types | **P0** | Basic, Basic (reversed), Cloze |
| C-05 | Custom Fields | **P1** | Custom field count and names |
| C-06 | Tags | **P1** | Tag notes for filtering |
| C-07 | Card Templates | **P1** | HTML/CSS with `{{FieldName}}` substitution |
| C-08 | Cloze Deletions | **P1** | `{{c1::text}}` cloze cards |
| C-09 | Duplicate Detection | **P2** | Warn on duplicate notes |
| C-10 | Flags | **P2** | Color-coded flags (Red, Orange, Green, Blue) |
| C-11 | Mark Notes | **P2** | Star important notes |
| C-12 | Suspend Cards | **P1** | Temporarily exclude from review |

### 3.3 Study/Review Screen

| ID | Feature | Priority | Description |
|---|---|---|---|
| S-01 | Study Session | **P0** | Front → reveal → answer (Again/Hard/Good/Easy) |
| S-02 | Card Counters | **P0** | Remaining: new, learning, review |
| S-03 | Next Interval | **P0** | Show intervals on answer buttons |
| S-04 | Congrats Screen | **P0** | Shown when all due cards finished |
| S-05 | Undo | **P1** | Undo last review |
| S-06 | Edit in Review | **P1** | Edit note during review |
| S-07 | Type Answer | **P2** | Type and compare answer |
| S-08 | Swipe Gestures | **P1** | Configurable gestures |
| S-09 | Auto-play Audio | **P1** | Auto-play audio on card show |
| S-10 | Whiteboard | **P2** | Draw on screen |
| S-11 | Session Timer | **P2** | Track study time |

### 3.4 Card Browser

| ID | Feature | Priority | Description |
|---|---|---|---|
| B-01 | Browse Cards | **P1** | List/search all cards |
| B-02 | Search | **P1** | Search by content, tags, deck, state |
| B-03 | Sort | **P2** | Sort by due date, ease, interval, etc. |
| B-04 | Bulk Actions | **P2** | Multi-select for suspend/delete/move |
| B-05 | Card Preview | **P2** | Preview card rendering |
| B-06 | Filter by State | **P1** | Filter: new/learning/review/suspended |

### 3.5 Media Support

| ID | Feature | Priority | Description |
|---|---|---|---|
| M-01 | Images | **P0** | Display imported images; add from camera/library |
| M-02 | Audio | **P1** | Play imported audio; record clips |
| M-03 | Text-to-Speech | **P1** | TTS for card content |
| M-04 | MathJax | **P2** | Math notation rendering |
| M-05 | Rich Text | **P1** | Bold, italic, underline, color |

### 3.6 Statistics & Progress

| ID | Feature | Priority | Description |
|---|---|---|---|
| ST-01 | Today's Stats | **P0** | Cards studied, time, correct/incorrect |
| ST-02 | Forecast Graph | **P1** | Future reviews/day prediction |
| ST-03 | Review Count Graph | **P1** | Historical reviews bar chart |
| ST-04 | Card State Pie | **P1** | New/young/mature/suspended distribution |
| ST-05 | Interval Distribution | **P2** | Interval histogram |
| ST-06 | Ease Distribution | **P2** | Ease factor histogram |
| ST-07 | Hourly Breakdown | **P2** | Activity by hour |
| ST-08 | Streak Counter | **P1** | Daily study streak |
| ST-09 | Retention Rate | **P1** | Correct recall percentage |

### 3.7 Import / Export

| ID | Feature | Priority | Description |
|---|---|---|---|
| I-01 | Import .apkg | **P0** | **Primary content source.** Unzip, parse SQLite, extract media |
| I-02 | Import CSV | **P2** | Import from CSV |
| I-03 | Export .apkg | **P2** | Export deck for Anki Desktop |

### 3.8 Local Data Persistence

| ID | Feature | Priority | Description |
|---|---|---|---|
| LP-01 | Save Progress | **P0** | All progress persisted in on-device SQLite |
| LP-02 | Resume Sessions | **P0** | No re-import needed between app sessions |
| LP-03 | Multiple Decks | **P0** | Persist multiple imported decks simultaneously |

### 3.9 Settings

| ID | Feature | Priority | Description |
|---|---|---|---|
| SE-01 | General | **P1** | New day start hour, default deck (English only) |
| SE-02 | Review Prefs | **P1** | Next review time display, button position |
| SE-03 | Notifications | **P1** | Daily study reminders |
| SE-04 | Gesture Config | **P2** | Custom swipe/tap actions |
| SE-05 | Font Settings | **P2** | Default font, size |

### 3.10 Custom Study

| ID | Feature | Priority | Description |
|---|---|---|---|
| F-01 | Custom Session | **P2** | Study ahead, review missed |
| F-02 | Filtered Deck | **P2** | Temp deck from search query |
| F-03 | Cram Mode | **P2** | Study cards outside schedule |

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Performance** | Study screen <100ms; DB queries <50ms |
| **Offline-first** | Fully offline, all data local |
| **Data Persistence** | SQLite survives restarts and reboots |
| **Accessibility** | VoiceOver, dynamic type, sufficient contrast |
| **App Size** | < 30MB initial |
| **Battery** | Minimal background processing |
| **iOS Version** | iOS 15+ |
| **Language** | English only |
| **Theme** | Light only |
