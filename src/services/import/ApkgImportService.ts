import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { AnkiDatabaseParser } from './AnkiDatabaseParser';
import { MediaExtractor } from './MediaExtractor';
import { dbService } from '../database/DatabaseService';
import { DeckRepository } from '../database/repositories/DeckRepository';
import { NoteTypeRepository } from '../database/repositories/NoteTypeRepository';
import { NoteRepository } from '../database/repositories/NoteRepository';
import { CardRepository } from '../database/repositories/CardRepository';

export class ApkgImportService {
  constructor(private onProgress: (progress: number, message: string) => void) { }

  async import(uri: string): Promise<void> {
    const tempDir = `${FileSystem.cacheDirectory}anki_import_${Date.now()}/`;

    try {
      // 1. Unzip .apkg (which is just a zip file)
      this.onProgress(10, 'Unzipping .apkg file...');
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const zip = new JSZip();
      const content = await zip.loadAsync(fileBase64, { base64: true });

      const filePaths: string[] = [];
      const totalFiles = Object.keys(content.files).length;
      let extractedCount = 0;

      for (const [filename, zipEntry] of Object.entries(content.files)) {
        if (zipEntry.dir) continue;
        const entryBase64 = await zipEntry.async('base64');
        const outputPath = `${tempDir}${filename}`;
        await FileSystem.writeAsStringAsync(outputPath, entryBase64, { encoding: FileSystem.EncodingType.Base64 });
        filePaths.push(outputPath);

        extractedCount++;
        this.onProgress(10 + Math.floor((extractedCount / totalFiles) * 20), `Extracting: ${filename}`);
      }

      // 2. Parse collection.anki2 or collection.anki21
      this.onProgress(35, 'Parsing Anki database...');
      let dbPath = `${tempDir}collection.anki2`;
      let dbInfo = await FileSystem.getInfoAsync(dbPath);

      if (!dbInfo.exists) {
        dbPath = `${tempDir}collection.anki21`;
        dbInfo = await FileSystem.getInfoAsync(dbPath);
      }

      if (!dbInfo.exists) {
        // List files for debugging if needed (log to console)
        const files = await FileSystem.readDirectoryAsync(tempDir);
        console.log('Files in extracted tempDir:', files);
        throw new Error('Invalid .apkg: Could not find collection.anki2 or collection.anki21');
      }

      // Move to SQLite directory to open with expo-sqlite
      const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
      const importDbPath = `${sqliteDir}import_anki.db`;
      const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
      if (!sqliteDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
      }

      // Clear any previous failed import
      try {
        await FileSystem.deleteAsync(importDbPath, { idempotent: true });
      } catch (e) { /* ignore */ }

      await FileSystem.copyAsync({ from: dbPath, to: importDbPath });

      const parser = new AnkiDatabaseParser('import_anki.db');
      const data = await parser.parse();

      // Cleanup: Delete the imported db from SQLite folder
      try {
        await FileSystem.deleteAsync(importDbPath, { idempotent: true });
      } catch (e) { /* ignore */ }

      // 3. Extract media
      this.onProgress(50, 'Extracting media files...');
      const targetMediaDir = `${FileSystem.documentDirectory}media`;
      await MediaExtractor.extractMedia(tempDir, targetMediaDir);

      // 4. Map to app schema and save
      this.onProgress(70, 'Saving to local database...');
      await this.saveToDatabase(data);

      this.onProgress(100, 'Import complete!');

    } catch (error: any) {
      console.error('Import error', error);
      throw new Error(`Failed to import: ${error.message}`);
    } finally {
      // Cleanup temp directory
      try {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      } catch (e) {
        console.warn('Failed to cleanup temp import dir', e);
      }
    }
  }

  private async saveToDatabase(data: any) {
    // In MVP: Insert everything directly. Later: Check for duplicates/merge.

    await dbService.execute('BEGIN TRANSACTION;');

    try {
      // Decks
      for (const deck of data.decks) {
        await DeckRepository.insert(deck);
      }

      // Note Types
      for (const nt of data.noteTypes) {
        await NoteTypeRepository.insert(nt);
      }

      for (const f of data.fieldDefs) {
        await NoteTypeRepository.insertFieldDef(f);
      }

      for (const t of data.templates) {
        await NoteTypeRepository.insertTemplate(t);
      }

      // Notes
      for (const n of data.notes) {
        await NoteRepository.insert({
          id: n.id,
          note_type_id: n.mid, // Anki's model id
          guid: n.guid,
          fields: n.flds,
          tags: n.tags,
          checksum: n.csum || 0,
          created_at: n.crt || Date.now()
        });
      }

      // Cards
      for (const c of data.cards) {
        await CardRepository.insert({
          id: c.id,
          note_id: c.nid,
          deck_id: c.did,
          template_ordinal: c.ord,
          type: 0, // Force 'new' state on import for MVP simplicity
          queue: 0, // Force 'new' queue
          due: 0,
          interval_days: 0,
          ease_factor: 2500,
          reps: 0,
          lapses: 0,
          flags: 0,
          created_at: Date.now()
        });
      }

      await dbService.execute('COMMIT;');
    } catch (error) {
      await dbService.execute('ROLLBACK;');
      throw error;
    }
  }
}
