import * as FileSystem from 'expo-file-system/legacy';

export class MediaExtractor {
  static async extractMedia(tempExtractedPath: string, targetMediaDirectory: string): Promise<void> {
    const mediaJsonPath = `${tempExtractedPath}/media`;
    const mediaJsonInfo = await FileSystem.getInfoAsync(mediaJsonPath);

    if (!mediaJsonInfo.exists) return;

    const mediaJsonString = await FileSystem.readAsStringAsync(mediaJsonPath);
    const mediaMap: Record<string, string> = JSON.parse(mediaJsonString);

    const targetDirInfo = await FileSystem.getInfoAsync(targetMediaDirectory);
    if (!targetDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetMediaDirectory, { intermediates: true });
    }

    for (const ObjectName in mediaMap) {
      if (!mediaMap.hasOwnProperty(ObjectName)) continue;

      const realFilename = mediaMap[ObjectName];
      const sourcePath = `${tempExtractedPath}/${ObjectName}`;
      const destPath = `${targetMediaDirectory}/${realFilename}`;

      const sourceInfo = await FileSystem.getInfoAsync(sourcePath);
      if (sourceInfo.exists) {
        await FileSystem.copyAsync({ from: sourcePath, to: destPath });
      }
    }
  }
}
