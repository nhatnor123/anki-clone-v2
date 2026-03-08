export interface NoteType {
    id: number;
    name: string;
    css: string;
    type: number; // 0=standard, 1=cloze
    sort_field_index: number;
    created_at: number;
}

export interface FieldDef {
    id: number;
    note_type_id: number;
    name: string;
    ordinal: number;
    font: string;
    font_size: number;
}

export interface NoteTypeWithFieldsAndTemplates extends NoteType {
    fields: FieldDef[];
    templates: import('./CardTemplate').CardTemplate[];
}
