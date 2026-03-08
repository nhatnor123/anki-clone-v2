/**
 * Parse Anki's 0x1f-separated field string into an array of strings.
 */
export const parseAnkiFields = (fields: string): string[] => {
    return fields.split('\u001f');
};
