import { dbService } from '../DatabaseService';
import { NoteType, FieldDef, NoteTypeWithFieldsAndTemplates } from '@/models/NoteType';
import { CardTemplate } from '@/models/CardTemplate';

export class NoteTypeRepository {
  static async getById(id: number): Promise<NoteType | null> {
    return dbService.queryFirst<NoteType>('SELECT * FROM note_types WHERE id = ?', [id]);
  }

  static async insert(type: Partial<NoteType>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO note_types (id, name, css, type, sort_field_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        type.id || null,
        type.name,
        type.css || '',
        type.type || 0,
        type.sort_field_index || 0,
        type.created_at || Date.now()
      ]
    );
    return result.lastInsertRowId;
  }

  static async insertFieldDef(field: Partial<FieldDef>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO field_defs (id, note_type_id, name, ordinal, font, font_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        field.id || null,
        field.note_type_id,
        field.name,
        field.ordinal,
        field.font || 'Arial',
        field.font_size || 20
      ]
    );
    return result.lastInsertRowId;
  }

  static async insertTemplate(template: Partial<CardTemplate>): Promise<number> {
    const result = await dbService.execute(
      `INSERT OR REPLACE INTO card_templates (id, note_type_id, name, ordinal, question_format, answer_format)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        template.id || null,
        template.note_type_id,
        template.name,
        template.ordinal,
        template.question_format,
        template.answer_format
      ]
    );
    return result.lastInsertRowId;
  }

  static async getWithFieldsAndTemplates(id: number): Promise<NoteTypeWithFieldsAndTemplates | null> {
    const type = await this.getById(id);
    if (!type) {
      return null;
    }

    const fields = await dbService.query<FieldDef>('SELECT * FROM field_defs WHERE note_type_id = ? ORDER BY ordinal ASC', [id]);
    const templates = await dbService.query<CardTemplate>('SELECT * FROM card_templates WHERE note_type_id = ? ORDER BY ordinal ASC', [id]);

    return { ...type, fields, templates };
  }
}
