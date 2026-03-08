import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable } from 'react-native';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { DeckListItem } from '../../src/components/deck/DeckListItem';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DeckListScreen() {
    const router = useRouter();
    const { decks, counts, isLoading, loadDecks } = useDeckStore();

    useEffect(() => {
        loadDecks();
    }, [loadDecks]);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Decks Yet</Text>
            <Text style={styles.emptySubtitle}>Import an .apkg file to start learning.</Text>
            <Pressable
                style={styles.importButton}
                onPress={() => router.push('/import')}
            >
                <Text style={styles.importButtonText}>Import Deck</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={decks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <DeckListItem
                        name={item.name}
                        counts={counts[item.id] || { newCount: 0, learningCount: 0, reviewCount: 0 }}
                        onPress={() => router.push(`/study/${item.id}`)}
                    />
                )}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={decks.length === 0 ? { flex: 1 } : null}
            />

            {decks.length > 0 && (
                <Pressable
                    style={styles.fab}
                    onPress={() => router.push('/import')}
                >
                    <Ionicons name="add" size={32} color="#ffffff" />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    importButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    importButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});
