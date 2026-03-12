import React, { useMemo, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useDeckStore } from '@/stores/useDeckStore';
import { DeckListItem } from '@/components/deck/DeckListItem';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedPressable } from '@/components/common/AnimatedPressable';

export default function DeckListScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { decks, counts, isLoading, loadDecks } = useDeckStore();
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <AnimatedPressable
                    onPress={() => router.push('/import')}
                    style={{ marginRight: 16 }}
                >
                    <Ionicons name="add-outline" size={28} color="#3b82f6" />
                </AnimatedPressable>
            ),
        });
    }, [navigation, router]);

    useFocusEffect(
        React.useCallback(() => {
            loadDecks();
        }, [loadDecks])
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Decks Yet</Text>
            <Text style={styles.emptySubtitle}>Import an .apkg file to start learning.</Text>
            <AnimatedPressable
                style={styles.importButton}
                onPress={() => router.push('/import')}
            >
                <Text style={styles.importButtonText}>Import Deck</Text>
            </AnimatedPressable>
        </View>
    );

    const processedDecks = useMemo(() => {
        const result: Array<{
            id: string | number;
            displayName: string;
            showGroupIcon: boolean;
            isSubItem: boolean;
            originalDeckId: number;
            counts: { newCount: number; learningCount: number; reviewCount: number };
            isExpanded?: boolean;
            hasChildren?: boolean;
            groupName?: string;
        }> = [];

        const groupCounts = new Map<string, { newCount: number; learningCount: number; reviewCount: number }>();
        const groupFirstDeckId = new Map<string, number>();

        // Pre-calculate aggregated counts for groups
        decks.forEach(deck => {
            const parts = deck.name.split('::');
            const groupName = parts[0];
            const count = counts[deck.id] || { newCount: 0, learningCount: 0, reviewCount: 0 };

            const current = groupCounts.get(groupName) || { newCount: 0, learningCount: 0, reviewCount: 0 };
            groupCounts.set(groupName, {
                newCount: current.newCount + count.newCount,
                learningCount: current.learningCount + count.learningCount,
                reviewCount: current.reviewCount + count.reviewCount,
            });

            if (!groupFirstDeckId.has(groupName)) {
                groupFirstDeckId.set(groupName, deck.id);
            }
        });

        const sortedDecks = [...decks].sort((a, b) => a.name.localeCompare(b.name));
        const renderedGroups = new Set<string>();

        sortedDecks.forEach((deck) => {
            const parts = deck.name.split('::');
            const groupName = parts[0];

            if (parts.length > 1) {
                if (!renderedGroups.has(groupName)) {
                    renderedGroups.add(groupName);
                    // Add aggregated group header
                    result.push({
                        id: `header-${groupName}`,
                        displayName: groupName,
                        showGroupIcon: true,
                        isSubItem: false,
                        originalDeckId: groupFirstDeckId.get(groupName)!,
                        counts: groupCounts.get(groupName)!,
                        hasChildren: true,
                        isExpanded: expandedGroups.has(groupName),
                        groupName: groupName,
                    });
                }

                // Add sub-item ONLY if group is expanded
                if (expandedGroups.has(groupName)) {
                    result.push({
                        id: deck.id,
                        displayName: parts.slice(1).join('::'),
                        showGroupIcon: false,
                        isSubItem: true,
                        originalDeckId: deck.id,
                        counts: counts[deck.id] || { newCount: 0, learningCount: 0, reviewCount: 0 },
                    });
                }
            } else {
                // Individual deck
                result.push({
                    id: deck.id,
                    displayName: deck.name,
                    showGroupIcon: true,
                    isSubItem: false,
                    originalDeckId: deck.id,
                    counts: counts[deck.id] || { newCount: 0, learningCount: 0, reviewCount: 0 },
                    hasChildren: false,
                });
            }
        });

        return result;
    }, [decks, counts, expandedGroups]);

    return (
        <View style={styles.container}>
            <FlatList
                data={processedDecks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <DeckListItem
                        name={item.displayName}
                        counts={item.counts}
                        onPress={() => {
                            if (item.hasChildren) {
                                toggleGroup(item.groupName!);
                            } else {
                                router.push(`/study/${item.originalDeckId}`);
                            }
                        }}
                        showGroupIcon={item.showGroupIcon}
                        isSubItem={item.isSubItem}
                        isExpanded={item.isExpanded}
                        hasChildren={item.hasChildren}
                    />
                )}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={decks.length === 0 ? { flex: 1 } : null}
            />
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
});
