import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export class SoundService {
    private static sound: Audio.Sound | null = null;
    private static mediaDir = `${FileSystem.documentDirectory}media/`;

    static async play(filename: string): Promise<void> {
        try {
            // Stop and unload previous sound
            if (this.sound) {
                await this.sound.stopAsync();
                await this.sound.unloadAsync();
                this.sound = null;
            }

            const uri = `${this.mediaDir}${filename}`;
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );

            this.sound = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                    if (this.sound === sound) this.sound = null;
                }
            });
        } catch (error) {
            console.error('Error playing sound:', filename, error);
        }
    }

    static async stop(): Promise<void> {
        if (this.sound) {
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
            this.sound = null;
        }
    }
}
