import { Tabs } from 'expo-router';
import { dbService } from '@/services/database/DatabaseService';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export default function RootLayout() {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                await dbService.initialize();
            } catch (e) {
                console.error('Failed to initialize database', e);
            } finally {
                setInitialized(true);
            }
        }
        init();
    }, []);

    if (!initialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#3b82f6' }}>
            <Tabs.Screen
                name="(tabs)/index"
                options={{
                    title: 'Decks',
                    headerShown: true,
                }}
            />
            <Tabs.Screen
                name="(tabs)/browser"
                options={{
                    title: 'Browser',
                }}
            />
            <Tabs.Screen
                name="(tabs)/stats"
                options={{
                    title: 'Stats',
                }}
            />
            <Tabs.Screen
                name="(tabs)/settings"
                options={{
                    title: 'Settings',
                }}
            />
            <Tabs.Screen
                name="import"
                options={{
                    href: null,
                    title: 'Import',
                }}
            />
            <Tabs.Screen
                name="study/[deckId]"
                options={{
                    href: null,
                    title: 'Study',
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
