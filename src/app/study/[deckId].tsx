import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput, Animated, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
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
        currentNote,
        currentHtml,
        currentSounds,
        showAnswer,
        isComplete,
        loadQueue,
        toggleAnswer,
        submitRating,
        resetDeckProgress
    } = useStudyStore();
    const [keywordInput, setKeywordInput] = useState('');
    const [isKeywordCorrect, setIsKeywordCorrect] = useState<boolean | null>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

    // Reset keyword state when card changes
    const currentCardId = queue[currentIndex]?.id;
    useEffect(() => {
        // console.log('Resetting keyword state for card:', currentIndex, currentCardId);
        setKeywordInput('');
        setIsKeywordCorrect(null);
    }, [currentIndex, currentCardId]);

    const handleShowAnswer = () => {
        setIsKeywordCorrect(null);
        setKeywordInput('');
        toggleAnswer();
    };

    const checkKeyword = () => {
        const correctKeyword = currentNote?.sfld?.trim().toLowerCase();
        const userInput = keywordInput.trim().toLowerCase();

        if (userInput === correctKeyword) {
            setIsKeywordCorrect(true);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                })
            ]).start();
            
            // Show answer immediately
            toggleAnswer();
        } else {
            setIsKeywordCorrect(false);
            // Vigorous Shake animation
            shakeAnim.setValue(0);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
            ]).start();
        }
    };

    const handleResetPress = () => {
        Alert.alert(
            "Reset Deck Progress",
            "Are you sure you want to reset all cards in this deck to 'New'? This will clear your current learning progress.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Reset Everything", 
                    style: "destructive",
                    onPress: async () => {
                        await resetDeckProgress();
                        // Additional feedback if needed
                    }
                }
            ]
        );
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AnimatedPressable onPress={handleResetPress} style={styles.headerResetButton}>
                        <Ionicons name="refresh" size={22} color="#ffffff" />
                    </AnimatedPressable>
                    <Text style={styles.counterText}>{currentIndex + 1} / {queue.length}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Card Content */}
                <View style={styles.cardContainer}>
                    <CardView html={currentHtml} />

                    {!showAnswer && (
                        <Animated.View style={[
                            styles.inputWrapper,
                            isKeywordCorrect === false && styles.inputWrapperError,
                            isKeywordCorrect === true && styles.inputWrapperSuccess,
                            { transform: [{ translateX: shakeAnim }] }
                        ]}>
                            <TextInput
                                style={[
                                    styles.keywordInput,
                                    isKeywordCorrect === false && styles.inputError,
                                    isKeywordCorrect === true && styles.inputSuccess,
                                ]}
                                placeholder="Type keyword to check..."
                                value={keywordInput}
                                onChangeText={(text) => {
                                    setKeywordInput(text);
                                    if (isKeywordCorrect !== null) setIsKeywordCorrect(null);
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                onSubmitEditing={checkKeyword}
                            />
                            {keywordInput.length > 0 && (
                                <Pressable 
                                    style={styles.clearButton} 
                                    onPress={() => {
                                        setKeywordInput('');
                                        setIsKeywordCorrect(null);
                                    }}
                                >
                                    <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                                </Pressable>
                            )}
                        </Animated.View>
                    )}

                    {isKeywordCorrect === true && (
                        <Animated.View style={[
                            styles.congratulationContainer,
                            { 
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}>
                            <Ionicons name="star" size={24} color="#f59e0b" />
                            <Text style={styles.congratulationText}>Correct! Well done!</Text>
                        </Animated.View>
                    )}
                    {isKeywordCorrect === false && (
                        <Text style={styles.errorText}>Oops! Try again.</Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.footer}>
                    {!showAnswer ? (
                        <View style={styles.actionRow}>
                            <AnimatedPressable style={styles.showAnswerButton} onPress={handleShowAnswer}>
                                <Text style={styles.showAnswerText}>Show Answer</Text>
                            </AnimatedPressable>
                            <Pressable 
                                style={[
                                    styles.checkButton,
                                    !keywordInput.trim() && styles.checkButtonDisabled
                                ]} 
                                onPress={checkKeyword}
                                disabled={!keywordInput.trim()}
                            >
                                <Text style={styles.checkButtonText}>Check</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.answerActionsContainer}>
                            {currentSounds.length > 0 && (
                                <AnimatedPressable
                                    style={styles.playSoundButton}
                                    onPress={() => SoundService.play(currentSounds[0])}
                                >
                                    <Ionicons name="volume-medium-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.playSoundText}>Play Sound</Text>
                                </AnimatedPressable>
                            )}
                            <AnswerButtons card={card} onRate={submitRating} />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
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
        paddingVertical: 8,
    },
    closeButton: {
        padding: 4,
    },
    counterText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    headerResetButton: {
        backgroundColor: '#6366f1', // Indigo to match relearn button
        padding: 8,
        borderRadius: 10,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    footer: {
        backgroundColor: '#ffffff',
    },
    showAnswerButton: {
        flex: 1,
        margin: 4,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
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
        paddingBottom: 0,
    },
    playSoundButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f3f4f6', // Light gray background
        borderRadius: 100, // Pill shape
        alignSelf: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    playSoundText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputWrapperError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    inputWrapperSuccess: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    keywordInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingBottom: 0,
    },
    checkButton: {
        flex: 1,
        backgroundColor: '#10b981', // Success green for check action
        margin: 4,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    checkButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 18,
    },
    clearButton: {
        padding: 4,
        marginRight: 4,
    },
    inputError: {
        color: '#ef4444',
    },
    inputSuccess: {
        color: '#10b981',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    congratulationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        backgroundColor: '#fef3c7',
        paddingVertical: 8,
        borderRadius: 8,
    },
    congratulationText: {
        marginLeft: 8,
        color: '#92400e',
        fontWeight: '600',
        fontSize: 14,
    },
});
