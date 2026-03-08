import { dbService } from '../DatabaseService';
import { Note } from '@/models/Note';

export class NoteRepository {
  static async getById(id: number): Promise<Note | null> {
    return dbService.queryFirst<Note>('SELECT * FROM notes WHERE id = ?', [id]);
  }

  static async insert(note: Partial<Note>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO notes (id, note_type_id, guid, fields, tags, checksum, created_at, modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        note.id || null, // Anki original ID if imported
        note.note_type_id,
        note.guid,
        note.fields || '',
        note.tags || '',
        note.checksum || 0,
        note.created_at || Date.now(),
        note.modified_at || Date.now()
      ]
    );
    return result.lastInsertRowId;
  }

  static async getByNoteTypeId(noteTypeId: number): Promise<Note[]> {
    return dbService.query<Note>('SELECT * FROM notes WHERE note_type_id = ?', [noteTypeId]);
  }
}
