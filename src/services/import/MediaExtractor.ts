import { File, Directory } from 'expo-file-system';

export class MediaExtractor {
  static async extractMedia(tempExtractedPath: string, targetMediaDirectory: string): Promise<void> {
    const tempDir = new Directory(tempExtractedPath);
    const mediaJsonFile = new File(tempDir, 'media');

    // console.log("mediaJsonPath", mediaJsonFile.uri);
    if (!mediaJsonFile.exists) {
      return;
    }

    const mediaJsonString = await mediaJsonFile.text();
    const mediaMap: Record<string, string> = JSON.parse(mediaJsonString);

    const targetDir = new Directory(targetMediaDirectory);
    // console.log("targetMediaDirectory", targetDir.uri);
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
        // console.log("copying ", sourceFile.uri, "to", destFile.uri);
        // check if destFile.uri contain 4000B1_001
        // if (destFile.uri.includes("4000B1_001")) {
        //   console.log("copying ", sourceFile.uri, "to", destFile.uri);
        // }
        await sourceFile.copy(destFile);
      }
    }
  }
}

