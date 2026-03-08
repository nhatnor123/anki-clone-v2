export interface CardTemplate {
    id: number;
    note_type_id: number;
    name: string;
    ordinal: number;
    question_format: string; // HTML with {{FieldName}}
    answer_format: string; // HTML with {{FieldName}} and {{FrontSide}}
}
