export interface Note {
    id: number;
    note_type_id: number;
    guid: string;
    fields: string; // 0x1f-separated field values
    tags: string;
    checksum: number;
    created_at: number;
    modified_at: number;
}
