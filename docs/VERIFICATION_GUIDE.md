# Phase 1: Run & Verification Guide

This guide explains how to run the Anki-clone-v2 application and verify that Phase 1 (Import & Study) is working correctly.

## 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **Expo Go**: Download the Expo Go app on your physical device (iOS/Android) or have an emulator set up.
- **Anki Deck (.apkg)**: You will need at least one `.apkg` file to test the import functionality. You can export one from Anki Desktop.

## 2. How to Run
1. Open your terminal in the project root: `d:\CODE\test_open_code\anki-clone-v2`.
2. Start the Expo development server:
   ```bash
   npm start
   ```
3. **Connect to the app**:
   - **Physical Device**: Scan the QR code shown in the terminal using the Expo Go app.
   - **Android Emulator**: Press `a` in the terminal.
   - **iOS Simulator**: Press `i` in the terminal.

## 3. Verification Steps

### Step 3.1: Import a Deck
1. On the initial screen (if no decks are present), tap the **"Import Deck"** button. If you already have decks, tap the **"+" FAB (Floating Action Button)** in the bottom right.
2. The file picker will open. Select your `.apkg` file.
3. Observe the progress bar. It should show steps like:
   - "Unzipping .apkg file..."
   - "Parsing Anki database..."
   - "Extracting media files..."
   - "Saving to local database..."
4. Once completed, you should be automatically redirected back to the Home screen.

### Step 3.2: Verify Deck List
1. Your imported deck should now appear in the list.
2. Verify that the **Blue (New)**, **Orange (Learning)**, and **Green (Review)** badges show the correct card counts for that deck.

### Step 3.3: Verify Study Session
1. Tap the deck you just imported.
2. The **Study Screen** should open, showing the first card's **Question**.
3. **Check Rendering**: Verify that the text is centered and any images are visible.
4. Tap **"Show Answer"**:
   - The card should flip/update to show the **Answer**.
   - Four rating buttons should appear at the bottom: **Again**, **Hard**, **Good**, **Easy**.
   - Each button should have an interval label (e.g., `< 1d`, `1d`, `4d`).
5. **Check FSRS Logic**:
   - Tap a rating (e.g., "Good").
   - The app should record the review and advance to the next card in the queue.
6. **Deck Completion**:
   - Continue until the queue of cards for today is finished.
   - You should see a **"Congratulations!"** screen with a button to return home.

### Step 3.4: Verify Media (Optional)
- If your deck contains audio, verify that it plays (if autoplay was enabled in Anki) or that the audio marker works.
- If your deck contains images, verify they are scaled properly to fit the screen.

## 4. Technical Verification
You can also run these commands to verify code quality:
- **Type Check**: `npm run typecheck`
- **Lint Check**: `npm run lint`
