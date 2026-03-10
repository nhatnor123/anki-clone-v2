import { AudioPlayer, AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

export class SoundService {
    private static player: AudioPlayer | null = null;
    private static getMediaDir(): string {
        const docDir = FileSystem.documentDirectory || '';
        const baseDir = docDir.endsWith('/') ? docDir : `${docDir}/`;
        return `${baseDir}media/`;
    }

    private static mediaDir = SoundService.getMediaDir();

    static async play(filename: string): Promise<void> {
        try {
            // Remove previous player
            if (this.player) {
                this.player.removeListener('playbackStatusUpdate', this.onStatusUpdate);
                if (typeof this.player.release === 'function') {
                    this.player.release();
                } else if (typeof this.player.remove === 'function') {
                    this.player.remove();
                }
                this.player = null;
            }

            const uri = `${this.mediaDir}${filename}`;
            // console.log("Playing sound from:", uri);

            // WORKAROUND: Bypass createAudioPlayer due to signature mismatch in expo-audio (Received 4 arguments, but 3 expected)
            // The native constructor expects 3 arguments: (source, updateInterval, keepAudioSessionActive)
            // @ts-ignore
            this.player = new AudioModule.AudioPlayer({ uri }, 500, false);

            if (this.player) {
                this.player.addListener('playbackStatusUpdate', this.onStatusUpdate);
                this.player.play();
            }
        } catch (error) {
            console.error('Error playing sound:', filename, error);
        }
    }

    private static onStatusUpdate = (status: any) => {
        if (status.didJustFinish) {
            if (this.player) {
                if (typeof this.player.release === 'function') {
                    this.player.release();
                } else if (typeof this.player.remove === 'function') {
                    this.player.remove();
                }
                this.player = null;
            }
        }
    };

    static async stop(): Promise<void> {
        if (this.player) {
            this.player.pause();
            // @ts-ignore
            if (typeof this.player.release === 'function') {
                this.player.release();
            } else if (typeof this.player.remove === 'function') {
                this.player.remove();
            }
            this.player = null;
        }
    }
}



