import * as SQLite from 'expo-sqlite';
import { NoteType, FieldDef } from '../../models/NoteType';
import { CardTemplate } from '../../models/CardTemplate';

export interface ParsedAnkiCollection {
    noteTypes: NoteType[];
    fieldDefs: FieldDef[];
    templates: CardTemplate[];
    decks: any[];
    notes: any[];
    cards: any[];
}

export class AnkiDatabaseParser {
    private db: SQLite.SQLiteDatabase | null = null;

    constructor(private dbPath: string) { }

    async parse(): Promise<ParsedAnkiCollection> {
        this.db = await SQLite.openDatabaseAsync(this.dbPath);

        try {
            const collectionRow = await this.db.getFirstAsync<{ models: string, decks: string }>('SELECT models, decks FROM col LIMIT 1');
            if (!collectionRow) {
                throw new Error('Invalid Anki database: Missing col table');
            }

            console.log('Collection row:', collectionRow);

            const modelsJson = JSON.parse(collectionRow.models);
            const decksJson = JSON.parse(collectionRow.decks);

            console.log('Models JSON:', modelsJson);
            console.log('Decks JSON:', decksJson);

            const { noteTypes, fieldDefs, templates } = this.parseModels(modelsJson);
            const decks = this.parseDecks(decksJson);

            const notes = await this.db.getAllAsync<any>('SELECT * FROM notes');
            const cards = await this.db.getAllAsync<any>('SELECT * FROM cards');

            await this.db.closeAsync();

            return { noteTypes, fieldDefs, templates, decks, notes, cards };
        } catch (e: any) {
            console.error('Failed to query col table in Anki database.', e);
            try {
                const tables = await this.db.getAllAsync<{ name: string }>('SELECT name FROM sqlite_master WHERE type="table"');
                console.log('Available tables in the database:', tables.map(t => t.name).join(', '));
            } catch (innerError) {
                console.error('Failed to list tables in the database', innerError);
            }
            await this.db.closeAsync();
            throw e;
        }
    }

    private parseModels(modelsJson: Record<string, any>) {
        const noteTypes: NoteType[] = [];
        const fieldDefs: FieldDef[] = [];
        const templates: CardTemplate[] = [];

        for (const [idStr, model] of Object.entries(modelsJson)) {
            const id = parseInt(idStr, 10);
            noteTypes.push({
                id,
                name: model.name,
                css: model.css,
                type: model.type,
                sort_field_index: model.sortf,
                created_at: Date.now()
            });

            model.flds.forEach((fld: any) => {
                fieldDefs.push({
                    id: 0, // auto-increment
                    note_type_id: id,
                    name: fld.name,
                    ordinal: fld.ord,
                    font: fld.font,
                    font_size: fld.size
                });
            });

            model.tmpls.forEach((tmpl: any) => {
                templates.push({
                    id: 0, // auto-increment
                    note_type_id: id,
                    name: tmpl.name,
                    ordinal: tmpl.ord,
                    question_format: tmpl.qfmt,
                    answer_format: tmpl.afmt
                });
            });
        }

        return { noteTypes, fieldDefs, templates };
    }

    private parseDecks(decksJson: Record<string, any>) {
        const decks: any[] = [];
        for (const [idStr, deck] of Object.entries(decksJson)) {
            const id = parseInt(idStr, 10);
            // Skip the default deck if it's the root 'Default' (id 1)
            if (id === 1 && deck.name === 'Default') {
                continue;
            }

            decks.push({
                id,
                name: deck.name,
                description: deck.desc || '',
                parent_id: null, // Basic parsing, ignores true nesting for MVP
                options: '{}',
                created_at: Date.now(),
                modified_at: Date.now()
            });
        }
        return decks;
    }
}
