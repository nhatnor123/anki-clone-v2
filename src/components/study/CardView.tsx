import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import * as FileSystem from 'expo-file-system/legacy';

interface CardViewProps {
    html: string;
}

export const CardView: React.FC<CardViewProps> = ({ html }) => {
    const baseUrl = `${FileSystem.documentDirectory}media/`;
    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html, baseUrl }}
                style={styles.webview}

                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                allowingReadAccessToURL="file://"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    webview: {
        backgroundColor: 'transparent',
    },
});
