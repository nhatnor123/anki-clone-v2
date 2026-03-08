import { Card } from '../../models/Card';
import { Note } from '../../models/Note';
import { NoteTypeWithFieldsAndTemplates } from '../../models/NoteType';
import * as FileSystem from 'expo-file-system/legacy';

export class TemplateRenderer {
  private static mediaDir = `file://${FileSystem.documentDirectory}media/`;

  static renderQuestion(card: Card, note: Note, noteType: NoteTypeWithFieldsAndTemplates): { html: string; sounds: string[] } {
    const template = noteType.templates[card.template_ordinal];
    return this.render(template.question_format, note, noteType, card);
  }

  static renderAnswer(card: Card, note: Note, noteType: NoteTypeWithFieldsAndTemplates, questionHtml: string): { html: string; sounds: string[] } {
    const template = noteType.templates[card.template_ordinal];
    const { html: answerHtml, sounds } = this.render(template.answer_format, note, noteType, card);

    // Replace {{FrontSide}} with the question content
    const html = answerHtml.replace(/\{\{FrontSide\}\}/g, questionHtml);

    return { html, sounds };
  }

  private static render(template: string, note: Note, noteType: NoteTypeWithFieldsAndTemplates, card?: Card): { html: string; sounds: string[] } {
    let html = template;
    const sounds: string[] = [];
    const fieldValues = note.fields.split('\u001f');

    // 0. Extract sound tags [sound:file.mp3]
    html = html.replace(/\[sound:(.*?)\]/gi, (match, filename) => {
      sounds.push(filename);
      return ''; // Remove from HTML as we play via SoundService
    });

    // 0. Special Anki Tags
    html = html.replace(/\{\{Tags\}\}/gi, note.tags || '');
    html = html.replace(/\{\{Type\}\}/gi, noteType.name || '');
    // For deck name, we'd need to pass it in, but for now just leave blank or use a placeholder
    html = html.replace(/\{\{Deck\}\}/gi, 'Deck');

    // 1. Handle Conditional Blocks ({{#Field}}...{{/Field}} and {{^Field}}...{{/Field}})
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

    // 2. Replace field placeholders
    noteType.fields.forEach((field, index) => {
      let value = fieldValues[index] || '';

      // Simple Cloze processing
      // Anki uses different card types for clozes. Usually if the template HAS a cloze: tag, it's a cloze view.
      const isClozeTag = html.includes(`cloze:${field.name}`) || html.includes(`cloze:${field.name.toLowerCase()}`);
      if (card && isClozeTag) {
        value = this.processCloze(value, card.template_ordinal + 1);
      }

      // Regex that matches {{FieldName}}, {{cloze:FieldName}}, {{type:cloze:FieldName}}, etc.
      // Case-insensitive ('i' flag) to match Anki behavior.
      const escapedName = field.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*(?:[\\w\\:]+\\:)?${escapedName}\\s*\\}\\}`, 'gi');
      html = html.replace(regex, value);
    });

    // 3. Resolve media paths (<img src="cat.jpg"> -> <img src="file:///.../media/cat.jpg">)
    html = html.replace(/src="([^"]+)"/gi, (match, filename) => {
      if (filename.startsWith('http') || filename.startsWith('data:')) return match;
      const baseFilename = filename.split('/').pop();
      return `src="${this.mediaDir}${baseFilename}"`;
    });

    // 4. Remove any remaining unknown tags to avoid visual mess
    html = html.replace(/\{\{[^}]+\}\}/g, '');

    // 5. Wrap in styling
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
