import { Paths, Directory, File } from 'expo-file-system';
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
    const tempDir = new Directory(Paths.cache, `anki_import_${Date.now()}`);

    // console.log("tempDir", tempDir.uri);

    try {
      // 1. Unzip .apkg (which is just a zip file)
      this.onProgress(10, 'Unzipping .apkg file...');
      if (!tempDir.exists) {
        await tempDir.create({ intermediates: true });
      }

      const zipFile = new File(uri);
      const fileBase64 = await zipFile.base64();
      const zip = new JSZip();
      const content = await zip.loadAsync(fileBase64, { base64: true });

      const totalFiles = Object.keys(content.files).length;
      let extractedCount = 0;

      for (const [filename, zipEntry] of Object.entries(content.files)) {
        if (zipEntry.dir) {
          continue;
        }
        const entryBase64 = await zipEntry.async('base64');
        const outputFile = new File(tempDir, filename);
        await outputFile.create({ overwrite: true });
        await outputFile.write(entryBase64, { encoding: 'base64' });

        extractedCount++;
        this.onProgress(10 + Math.floor((extractedCount / totalFiles) * 20), `Extracting: ${filename}`);
      }

      // 2. Parse collection.anki2 or collection.anki21
      this.onProgress(35, 'Parsing Anki database...');
      let dbFile = new File(tempDir, 'collection.anki2');

      if (!dbFile.exists) {
        dbFile = new File(tempDir, 'collection.anki21');
      }

      if (!dbFile.exists) {
        // List files for debugging
        const files = tempDir.list();
        console.log('Files in extracted tempDir:', files.map(f => f.uri));
        throw new Error('Invalid .apkg: Could not find collection.anki2 or collection.anki21');
      }

      // Move to SQLite directory to open with expo-sqlite
      const sqliteDir = new Directory(Paths.document, 'SQLite');
      const importDbFile = new File(sqliteDir, 'import_anki.db');

      if (!sqliteDir.exists) {
        sqliteDir.create({ intermediates: true });
      }

      // Clear any previous failed import
      if (importDbFile.exists) {
        importDbFile.delete();
      }

      dbFile.copy(importDbFile);

      const parser = new AnkiDatabaseParser('import_anki.db');
      const data = await parser.parse();

      // console.log("data after parsing", data);

      // Cleanup: Delete the imported db from SQLite folder
      if (importDbFile.exists) {
        importDbFile.delete();
      }

      // 3. Extract media
      this.onProgress(50, 'Extracting media files...');
      const targetMediaDir = new Directory(Paths.document, 'media').uri + '/';
      await MediaExtractor.extractMedia(tempDir.uri, targetMediaDir);

      // 4. Map to app schema and save
      this.onProgress(70, 'Saving to local database...');
      await this.saveToDatabase(data);

      this.onProgress(100, 'Import complete!');

    } catch (error: any) {
      console.error('Import error', error);
      throw new Error(`Failed to import: ${error.message}`);
    } finally {
      // Cleanup temp directory
      if (tempDir.exists) {
        tempDir.delete();
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

