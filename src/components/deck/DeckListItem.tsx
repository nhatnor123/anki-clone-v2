import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';

interface DeckListItemProps {
    name: string;
    counts: {
        newCount: number;
        learningCount: number;
        reviewCount: number;
    };
    onPress: () => void;
}

export const DeckListItem: React.FC<DeckListItemProps> = ({ name, counts, onPress }) => {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>

            <View style={styles.countsContainer}>
                <View style={[styles.badge, { backgroundColor: Colors.newCount }]}>
                    <Text style={styles.badgeText}>{counts.newCount}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: Colors.learningCount }]}>
                    <Text style={styles.badgeText}>{counts.learningCount}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: Colors.reviewCount }]}>
                    <Text style={styles.badgeText}>{counts.reviewCount}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
        flex: 1,
        marginRight: 12,
    },
    countsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        minWidth: 32,
        alignItems: 'center',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
