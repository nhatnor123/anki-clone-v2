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
        submitRating
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
                <Pressable style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
                    <Text style={styles.homeButtonText}>Back to Decks</Text>
                </Pressable>
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

    console.log("currentHtml", currentHtml);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </Pressable>
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
                    <Pressable style={styles.showAnswerButton} onPress={handleShowAnswer}>
                        <Text style={styles.showAnswerText}>Show Answer</Text>
                    </Pressable>
                ) : (
                    <AnswerButtons card={card} onRate={submitRating} />
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
});
