import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardCounterProps {
    newCount: number;
    learningCount: number;
    reviewCount: number;
}

export const CardCounter: React.FC<CardCounterProps> = ({ newCount, learningCount, reviewCount }) => {
    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: Colors.newCount }]}>{newCount}</Text>
            <Text style={[styles.text, { color: Colors.learningCount }]}>{learningCount}</Text>
            <Text style={[styles.text, { color: Colors.reviewCount }]}>{reviewCount}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
