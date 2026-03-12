import { File, Directory } from 'expo-file-system';

export class MediaExtractor {
  static async extractMedia(tempExtractedPath: string, targetMediaDirectory: string): Promise<void> {
    const tempDir = new Directory(tempExtractedPath);
    const mediaJsonFile = new File(tempDir, 'media');

    if (!mediaJsonFile.exists) {
      return;
    }

    const mediaJsonString = await mediaJsonFile.text();
    const mediaMap: Record<string, string> = JSON.parse(mediaJsonString);

    const targetDir = new Directory(targetMediaDirectory);
    if (!targetDir.exists) {
      await targetDir.create({ intermediates: true });
    }

    for (const ObjectName in mediaMap) {
      if (!mediaMap.hasOwnProperty(ObjectName)) {
        continue;
      }

      const realFilename = mediaMap[ObjectName];
      const sourceFile = new File(tempDir, ObjectName);
      const destFile = new File(targetDir, realFilename);

      if (sourceFile.exists) {
        if (destFile.exists) {
          await destFile.delete();
        }
        await sourceFile.copy(destFile);
      }
    }
  }
}

