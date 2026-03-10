import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStudyStore } from '@/stores/useStudyStore';
import { CardView } from '@/components/study/CardView';
import { AnswerButtons } from '@/components/study/AnswerButtons';
import { CardCounter } from '@/components/study/CardCounter';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { SoundService } from '@/services/media/SoundService';

import { AnimatedPressable } from '@/components/common/AnimatedPressable';

export default function StudyScreen() {

    const { deckId } = useLocalSearchParams();
    const router = useRouter();
    const {
        queue,
        currentIndex,
        currentHtml,
        currentSounds,
        showAnswer,
        isComplete,
        loadQueue,
        toggleAnswer,
        submitRating,
        resetDeckProgress
    } = useStudyStore();

    useEffect(() => {
        if (deckId) {
            loadQueue(parseInt(deckId as string, 10));
        }
        return () => {
            SoundService.stop();
        };
    }, [deckId]);

    // Play sounds when they change
    useEffect(() => {
        if (currentSounds && currentSounds.length > 0) {
            // Play them in sequence or just the first one for MVP
            SoundService.play(currentSounds[0]);
        }
    }, [currentSounds]);

    const handleShowAnswer = () => {
        toggleAnswer();
    };

    if (isComplete) {
        return (
            <View style={styles.completeContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                <Text style={styles.completeTitle}>Congratulations!</Text>
                <Text style={styles.completeSubtitle}>You have finished this deck for today.</Text>
                <AnimatedPressable style={styles.relearnButton} onPress={resetDeckProgress}>
                    <Ionicons name="refresh" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.homeButtonText}>Re-learn this Deck</Text>
                </AnimatedPressable>
                <AnimatedPressable style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
                    <Text style={styles.homeButtonText}>Back to Decks</Text>
                </AnimatedPressable>
            </View>
        );
    }

    if (!currentHtml) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const card = queue[currentIndex];

    // console.log("currentHtml", currentHtml);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <AnimatedPressable onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </AnimatedPressable>
                <CardCounter
                    newCount={queue.filter((c, i) => i >= currentIndex && c.queue === 0).length}
                    learningCount={queue.filter((c, i) => i >= currentIndex && c.queue === 1).length}
                    reviewCount={queue.filter((c, i) => i >= currentIndex && c.queue === 2).length}
                />
                <Text style={styles.counterText}>{currentIndex + 1} / {queue.length}</Text>
            </View>

            {/* Card Content */}
            <View style={styles.cardContainer}>
                <CardView html={currentHtml} />
            </View>

            {/* Actions */}
            <View style={styles.footer}>
                {!showAnswer ? (
                    <AnimatedPressable style={styles.showAnswerButton} onPress={handleShowAnswer}>
                        <Text style={styles.showAnswerText}>Show Answer</Text>
                    </AnimatedPressable>
                ) : (
                    <View style={styles.answerActionsContainer}>
                        {currentSounds.length > 0 && (
                            <AnimatedPressable
                                style={styles.playSoundButton}
                                onPress={() => SoundService.play(currentSounds[0])}
                            >
                                <Ionicons name="volume-medium-outline" size={24} color={Colors.primary} />
                                <Text style={styles.playSoundText}>Play Sound</Text>
                            </AnimatedPressable>
                        )}
                        <AnswerButtons card={card} onRate={submitRating} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    closeButton: {
        padding: 4,
    },
    counterText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    footer: {
        backgroundColor: '#ffffff',
    },
    showAnswerButton: {
        margin: 16,
        marginBottom: 24,
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    showAnswerText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    completeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    completeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 24,
    },
    completeSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 40,
    },
    homeButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    homeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    relearnButton: {
        backgroundColor: '#6366f1', // Indigo color for distinct action
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    answerActionsContainer: {
        paddingBottom: 8,
    },
    playSoundButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f3f4f6', // Light gray background
        borderRadius: 100, // Pill shape
        alignSelf: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    playSoundText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
