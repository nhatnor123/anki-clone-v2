import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Paths } from 'expo-file-system';

export class SoundService {
    private static player: AudioPlayer | null = null;
    private static getMediaDir(): string {
        const docDir = Paths.document.uri || '';
        const baseDir = docDir.endsWith('/') ? docDir : `${docDir}/`;
        return `${baseDir}media/`;
    }

    private static mediaDir = SoundService.getMediaDir();

    static async play(filename: string): Promise<void> {
        try {
            // Remove previous player
            if (this.player) {
                this.player.removeListener('playbackStatusUpdate', this.onStatusUpdate);
                this.player.release();
                this.player = null;
            }

            const uri = `${this.mediaDir}${filename}`;
            this.player = createAudioPlayer(uri);
            this.player.addListener('playbackStatusUpdate', this.onStatusUpdate);
            this.player.play();
        } catch (error) {
            console.error('Error playing sound:', filename, error);
        }
    }

    private static onStatusUpdate = (status: any) => {
        if (status.didJustFinish) {
            if (this.player) {
                this.player.release();
                this.player = null;
            }
        }
    };

    static async stop(): Promise<void> {
        if (this.player) {
            this.player.pause();
            this.player.release();
            this.player = null;
        }
    }
}



