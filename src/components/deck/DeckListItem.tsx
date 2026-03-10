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
    showGroupIcon?: boolean;
    isSubItem?: boolean;
    isExpanded?: boolean;
    hasChildren?: boolean;
}

import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../common/AnimatedPressable';

export const DeckListItem: React.FC<DeckListItemProps> = ({
    name,
    counts,
    onPress,
    showGroupIcon,
    isSubItem,
    isExpanded,
    hasChildren
}) => {
    return (
        <AnimatedPressable
            style={[
                styles.container,
                isSubItem && styles.subItemContainer
            ]}
            onPress={onPress}
        >
            <View style={styles.nameContainer}>
                {hasChildren && (
                    <Ionicons
                        name={isExpanded ? "chevron-down" : "chevron-forward"}
                        size={18}
                        color={Colors.textSecondary}
                        style={styles.chevron}
                    />
                )}
                {showGroupIcon && (
                    <Ionicons
                        name="folder-outline"
                        size={20}
                        color={Colors.primary}
                        style={styles.groupIcon}
                    />
                )}
                <Text style={styles.name}>{name}</Text>
            </View>

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
        </AnimatedPressable>
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
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    groupIcon: {
        marginRight: 8,
    },
    chevron: {
        marginRight: 4,
    },
    subItemContainer: {
        paddingLeft: 44,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
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
