import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useDeckStore } from '@/stores/useDeckStore';
import { useImportStore } from '@/stores/useImportStore';
import { ApkgImportService } from '@/services/import/ApkgImportService';
import { useRouter } from 'expo-router';

export default function ImportScreen() {
    const router = useRouter();
    const loadDecks = useDeckStore(state => state.loadDecks);
    const { status, progress, message, error, setStatus, setProgress, setError, reset } = useImportStore();

    const handleImport = async () => {
        try {
            reset();
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled || result.assets.length === 0) {
                return;
            }

            const fileUri = result.assets[0].uri;
            setStatus('parsing', 'Starting import...');

            const service = new ApkgImportService((p: number, m: string) => {
                setProgress(p);
                setStatus('saving_db', m);
            });

            await service.import(fileUri);

            // Refresh the deck list
            await loadDecks();

            setStatus('success', 'Import completed successfully!');

            // Return back to home
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 1000);

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during import.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Import Deck</Text>
            <Text style={styles.subtitle}>Select an .apkg file exported from Anki</Text>

            {status === 'idle' || status === 'error' || status === 'success' ? (
                <Pressable style={styles.button} onPress={handleImport}>
                    <Text style={styles.buttonText}>Select .apkg File</Text>
                </Pressable>
            ) : null}

            {status !== 'idle' && (
                <View style={styles.progressContainer}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.percentage}>{progress}%</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}

            {status === 'success' && (
                <View style={styles.successContainer}>
                    <Text style={styles.successText}>Successfully imported! Redirecting...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 24,
    },
    message: {
        fontSize: 16,
        color: '#4b5563',
        marginBottom: 12,
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10b981',
    },
    percentage: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    errorContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        width: '100%',
    },
    errorText: {
        color: '#b91c1c',
        fontSize: 14,
    },
    successContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#d1fae5',
        borderRadius: 8,
        width: '100%',
    },
    successText: {
        color: '#047857',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    }
});
