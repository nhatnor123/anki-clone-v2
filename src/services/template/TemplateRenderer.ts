import { Card } from '../../models/Card';
import { Note } from '../../models/Note';
import { NoteTypeWithFieldsAndTemplates } from '../../models/NoteType';
import * as FileSystem from 'expo-file-system/legacy';

export class TemplateRenderer {
  private static getMediaDir(): string {
    const docDir = FileSystem.documentDirectory || '';
    // Ensure it ends with / but doesn't have double slashes
    const baseDir = docDir.endsWith('/') ? docDir : `${docDir}/`;
    return `${baseDir}media/`;
  }

  private static mediaDir = TemplateRenderer.getMediaDir();


  static async renderQuestion(card: Card, note: Note, noteType: NoteTypeWithFieldsAndTemplates): Promise<{ html: string; sounds: string[] }> {
    const template = noteType.templates[card.template_ordinal];
    return await this.render(template.question_format, note, noteType, card);
  }

  static async renderAnswer(card: Card, note: Note, noteType: NoteTypeWithFieldsAndTemplates, questionHtml: string): Promise<{ html: string; sounds: string[] }> {
    const template = noteType.templates[card.template_ordinal];
    const { html: answerHtml, sounds } = await this.render(template.answer_format, note, noteType, card);

    // Replace {{FrontSide}} with the question content
    const html = answerHtml.replace(/\{\{FrontSide\}\}/g, questionHtml);

    return { html, sounds };
  }

  private static async getImageBase64(filename: string): Promise<string | null> {
    try {
      const baseFilename = filename.split('/').pop() || filename;
      const uri = `${this.mediaDir}${baseFilename}`;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn(`File does not exist: ${uri}`);
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const extension = baseFilename.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg';
      if (extension === 'png') mimeType = 'image/png';
      else if (extension === 'gif') mimeType = 'image/gif';
      else if (extension === 'svg') mimeType = 'image/svg+xml';
      else if (extension === 'webp') mimeType = 'image/webp';

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error(`Error reading image to base64: ${filename}`, error);
      return null;
    }
  }

  private static async render(template: string, note: Note, noteType: NoteTypeWithFieldsAndTemplates, card?: Card): Promise<{ html: string; sounds: string[] }> {
    let html = template;
    const sounds: string[] = [];
    const fieldValues = note.fields.split('\u001f');

    // 1. Special Anki Tags
    html = html.replace(/\{\{Tags\}\}/gi, note.tags || '');
    html = html.replace(/\{\{Type\}\}/gi, noteType.name || '');
    html = html.replace(/\{\{Deck\}\}/gi, 'Deck');

    // 2. Handle Conditional Blocks ({{#Field}}...{{/Field}} and {{^Field}}...{{/Field}})
    noteType.fields.forEach((field, index) => {
      const value = fieldValues[index] || '';
      const hasContent = value.trim().length > 0 && value.trim() !== '<br>' && value.trim() !== '<br />';
      const escapedName = field.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // {{#Field}}...{{/Field}} - Show only if Field has content
      const posRegex = new RegExp(`\\{\\{\\#${escapedName}\\}\\}([\\s\\S]*?)\\{\\{\\/${escapedName}\\}\\}`, 'gi');
      html = html.replace(posRegex, hasContent ? '$1' : '');

      // {{^Field}}...{{/Field}} - Show only if Field is empty
      const negRegex = new RegExp(`\\{\\{\\^${escapedName}\\}\\}([\\s\\S]*?)\\{\\{\\/${escapedName}\\}\\}`, 'gi');
      html = html.replace(negRegex, hasContent ? '' : '$1');
    });

    // 3. Replace field placeholders
    noteType.fields.forEach((field, index) => {
      let value = fieldValues[index] || '';

      // Simple Cloze processing
      const isClozeTag = html.includes(`cloze:${field.name}`) || html.includes(`cloze:${field.name.toLowerCase()}`);
      if (card && isClozeTag) {
        value = this.processCloze(value, card.template_ordinal + 1);
      }

      const escapedName = field.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*(?:[\\w\\:]+\\:)?${escapedName}\\s*\\}\\}`, 'gi');
      html = html.replace(regex, value);
    });

    // 4. Extract sound tags [sound:file.mp3] (Do this after fields are replaced)
    html = html.replace(/\[sound:(.*?)\]/gi, (match, filename) => {
      sounds.push(filename.trim());
      return '';
    });

    // 5. Resolve media paths and convert to Base64
    const imgRegex = /src=['"]([^'"]+)['"]/gi;
    let match;
    const replacements: { original: string; base64: string }[] = [];

    while ((match = imgRegex.exec(html)) !== null) {
      const filename = match[1];
      if (!filename.startsWith('http') && !filename.startsWith('data:')) {
        const base64Data = await this.getImageBase64(filename);
        if (base64Data) {
          replacements.push({ original: filename, base64: base64Data });
        }
      }
    }

    // Apply replacements
    for (const replacement of replacements) {
      // Use split/join to replace all occurrences effectively
      html = html.split(`src="${replacement.original}"`).join(`src="${replacement.base64}"`);
      html = html.split(`src='${replacement.original}'`).join(`src='${replacement.base64}'`);
    }

    // 6. Remove any remaining unknown tags
    html = html.replace(/\{\{[^}]+\}\}/g, '');

    // 7. Wrap in styling
    const wrappedHtml = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: -apple-system, system-ui; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              padding: 20px;
              color: #1f2937;
              background-color: #ffffff;
              text-align: center;
              line-height: 1.5;
            }
            img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
            .card { width: 100%; }
            .cloze { color: #3b82f6; font-weight: bold; }
            ${noteType.css}
          </style>
        </head>
        <body>
          <div class="card">${html}</div>
        </body>
      </html>
    `;

    return { html: wrappedHtml, sounds };
  }
  private static processCloze(content: string, ordinal: number): string {
    const regex = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g;
    return content.replace(regex, (match, cNum, text, hint) => {
      const isTarget = parseInt(cNum, 10) === ordinal;
      if (isTarget) {
        return `<span class="cloze">[${hint || '...'}]</span>`;
      } else {
        return text;
      }
    });
  }
}
