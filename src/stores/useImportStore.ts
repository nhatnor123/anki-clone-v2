import { create } from 'zustand';

export type ImportStatus = 'idle' | 'picking' | 'unzipping' | 'parsing' | 'extracting_media' | 'saving_db' | 'success' | 'error';

interface ImportState {
    status: ImportStatus;
    progress: number; // 0 to 100
    message: string;
    error: string | null;

    setStatus: (status: ImportStatus, message?: string) => void;
    setProgress: (progress: number) => void;
    setError: (error: string) => void;
    reset: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
    status: 'idle',
    progress: 0,
    message: '',
    error: null,

    setStatus: (status, message = '') => set({ status, message, error: null }),
    setProgress: (progress) => set({ progress }),
    setError: (error) => set({ status: 'error', error, progress: 0 }),
    reset: () => set({ status: 'idle', progress: 0, message: '', error: null })
}));
