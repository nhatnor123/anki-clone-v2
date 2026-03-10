import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Rating } from 'ts-fsrs';
import { Colors } from '../../constants/colors';

import { Card } from '@/models/Card';
import { SchedulerService } from '../../services/scheduler/SchedulerService';

interface AnswerButtonsProps {
    card: Card;
    onRate: (rating: Rating) => void;
}

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({ card, onRate }) => {
    if (!card) {
        return null;
    }
    const intervals = SchedulerService.getNextIntervals(card);

    const buttons = [
        { rating: Rating.Again, label: 'Again', color: Colors.again },
        { rating: Rating.Hard, label: 'Hard', color: Colors.hard },
        { rating: Rating.Good, label: 'Good', color: Colors.good },
        { rating: Rating.Easy, label: 'Easy', color: Colors.easy },
    ];

    return (
        <View style={styles.container}>
            {buttons.map((btn) => (
                <Pressable
                    key={btn.rating}
                    style={[styles.button, { backgroundColor: btn.color }]}
                    onPress={() => onRate(btn.rating)}
                >
                    <Text style={styles.buttonText}>{btn.label}</Text>
                    <Text style={styles.intervalText}>{intervals[btn.rating]}</Text>
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
        paddingBottom: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    intervalText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 11,
        marginTop: 2,
    },
});
