/**
 * Date utility helpers for Anki-clone.
 */

export const nowMs = (): number => Date.now();

export const todayAsEpochDays = (): number => {
    return Math.floor(Date.now() / 86400000);
};

export const epochDaysToDate = (days: number): Date => {
    return new Date(days * 86400000);
};

export const formatInterval = (days: number): string => {
    if (days < 1) {
        return '< 1d';
    }
    if (days < 30) {
        return `${Math.round(days)}d`;
    }
    if (days < 365) {
        return `${(days / 30).toFixed(1)}mo`;
    }
    return `${(days / 365).toFixed(1)}yr`;
};
